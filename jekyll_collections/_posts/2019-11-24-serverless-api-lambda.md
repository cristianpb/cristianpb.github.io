---
layout: post
title: "Deploy a serverless API using lambda with SAM CLI and a Swagger model
"
date: 2019-11-25
description: Serverless functions are the new normal. No more worries about server management, just push your code and forget about the rest.
categories:
  - programming
tags: aws python serverless swagger
image:
  path: /assets/img/serverless-api-lambda/main-4x3.jpg
  height: 1050
  width: 1400
thumb:
  path: /assets/img/serverless-api-lambda/main-thumb.jpg
  height: 200
  width: 300

---

Developing an API usually implies a framework like Flask in python or express 
in nodejs. Both of them are very powerful and easy to use, but they need a 
server to be running and when someone says server it says also maintenance, 
load balancing, security, updates and many other responsibilities that comes 
when running an instance.

In order to avoid a server deployment, there are some options like the
[Serveless Framework](https://www.npmjs.com/package/serverless), [Google
Cloud](https://cloud.google.com/functions/) or [AWS
Lambda](https://aws.amazon.com/lambda/).
However, each platform has its own particularities and it's not so simple when
you want to go beyond the example in the documentation. For example, in the
case of [IA Flash](https://iaflash.fr) project, we needed to send several
images to the API and get a json as a response. The classical examples shows
how to send one image encoded in the body of the request, but there is no
documentation about how to send several images encoded in the body.

In this post I will explain how to send several attachments to AWS lambda
functions and also to do it in a programmatic way by having a deployment script
and a development environment to test the function before uploading to the
cloud.  

<center>
<amp-img src="/assets/img/serverless-api-lambda/main.jpg" width="800" height="366" layout="intrinsic"></amp-img>
<br><i>SAM Cli uses a swagger file to configure the Gateway API, an interface to AWS Lambda functions</i>
</center>

## AWS Lambda

Two API have been developed for the IA Flash project:
* [a first one](https://github.com/ia-flash/matchvec) that process an image and send predictions from a deep learning model ;
* [a second one](https://github.com/ia-flash/sivnorm) that takes a vehicle make and model to do a fuzzy matching with a referential table of makes and models.

We wanted to deploy these applications in AWS lambda to have a serverless
infrastructure and simplify our work. 

For the first API, our Flask application does the following:
1. reads images from a multipart form
1. parses images from the buffer
1. decode the image into a numpy array
1. makes an deep learning inference
1. append the result to a list that would be send as a response

Which can be written in python as:

```python
for i in range(len(images)):
     nparr = np.frombuffer(images[i].read(), np.uint8)
     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
     img = cv2.cvtColor(img , cv2.COLOR_BGR2RGB)
     res.append(predict_objects(img))
```

This can be translated into lambda function handler like:

```python
def lambda_handler_classification(event, context):
    res = list()
    assert event.get('httpMethod') == 'POST'
    try :
        event['body'] = base64.b64decode(event['body'])
    except :
         return {
        'statusCode': 400,
        'body': json.dumps(res)
        }

    if event['path'] == '/predict' :
        infer_func = predict_class
    elif event['path'] == '/object_detection' :
        infer_func = predict_objects
    else:
         return {
        'statusCode': 404,
        'body': json.dumps(res)
        }

    content_type = event.get('headers', {"content-type" : ''}).get('content-type')
    if 'multipart/form-data' in content_type  :

        # convert to bytes if need
        if type(event['body']) is str:
            event['body'] = bytes(event['body'],'utf-8')

        multipart_data = decoder.MultipartDecoder(event['body'], content_type)
        for part in multipart_data.parts:
            content_disposition = part.headers.get(b'Content-Disposition',b'').decode('utf-8')
            search_field = pattern.search(content_disposition)
            #import pdb; pdb.set_trace()
            if search_field :
                if search_field.group(0) == 'image' :
                    try:
                        img_io = io.BytesIO(part.content)
                        img_io.seek(0)
                        img = Image.open(img_io)
                        img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2RGB)
                        res.append(infer_func(img))
                    except Exception as e:
                        print(e)
                        res.append([])

                elif search_field.group(0) == 'url' :
                    try:
                        resp = urlopen(part.content.decode('utf-8'))
                        img = np.asarray(bytearray(resp.read()), dtype="uint8")
                        img = cv2.imdecode(img, cv2.IMREAD_COLOR)
                        img = cv2.cvtColor(img , cv2.COLOR_BGR2RGB)
                        res.append(infer_func(img))
                    except Exception as e:
                        print(e)
                        res.append([])
                else :
                    print('Bad field name in form-data')

    return {
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
            'statusCode': 200,
            'body': json.dumps(res)
            }
```

You might notice two essential parts:
* the content of the body is encoded in base64 format, so it can be decoded using the following function: 
```python
event['body'] = base64.b64decode(event['body'])
```
* the library [request toolbelt](https://github.com/requests/toolbelt) provides some tools to decode
  *multipart/form-data* using the boundary of each part, then it's possible to
  iterate in each part using the following function:
```python
  multipart_data = decoder.MultipartDecoder(event['body'], content_type)
  for part in multipart_data.parts:
      img_io = io.BytesIO(part.content)
      img_io.seek(0)
```

This method allows us to send the several files to the API.

## SAM CLI

AWS web console has a nice interface to deploy the API, but as many graphical
interfaces, you won't get replicability and it's takes take if you have to do it
again. 

AWS provides a [Serverless Application Model](https://github.com/awslabs/serverless-application-model) (SAM) to deploy applications using a `yaml` file.
This template can be used to:
* deploy a local API to test using `sam local start-api`
* package your lambda function and push it to s3 using `sam package --template-file aws_lambda/template.yaml --s3-bucket iaflash --output-template-file packaged.yaml`
* deploy your lambda function using cloudformation with `aws cloudformation deploy --template-file packaged.yaml --stack-name matchvec` 

Take a look at the `template.yaml` from IA Flash project:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  IA Flash

Globals:
  Function:
    Timeout: 200
    MemorySize: 512
    Environment:
      Variables:
        BACKEND: onnx
        DETECTION_THRESHOLD: 0.4
        BASE_MODEL_PATH: /tmp
        CLASSIFICATION_MODEL: resnet18-102
        DETECTION_MODEL: ssd
        DETECTION_THRESHOLD: 0.4
Resources:
  MatchvecApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: Prod
      DefinitionUri: ./swagger.yaml
      BinaryMediaTypes:
         - multipart~1form-data
  MatchvecFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: MatchvecFunction
      CodeUri:  ./
      Handler: lambda_function.lambda_handler_classification
      Role: !Sub arn:aws:iam::${AWS::AccountId}:role/lambda
      Runtime: python3.6
      Policies:
        - AWSLambdaBasicExecutionRole
      Layers:
          - arn:aws:lambda:eu-west-1:016363657960:layer:onnx:1
          - arn:aws:lambda:eu-west-1:016363657960:layer:opencv:1
          - arn:aws:lambda:eu-west-1:016363657960:layer:pandas:1
          - arn:aws:lambda:eu-west-1:016363657960:layer:pillow:2
      Events:
        PostEvent:
          Type: Api
          Properties:
            RestApiId: !Ref "MatchvecApi"
            Path: "/{proxy+}"
            Method: POST
```

* Global section define global characteristics of the lambda function.
* The Resources section where there are two resources defined:
  * A AWS API that will be represented as a AWS API Gateway service.
  * A AWS lambda function.

### AWS API

One important parameter for the serveless API is:
  ```yaml
  BinaryMediaTypes:
  - multipart~1form-data
  ```
which tells API Gateway to treat *multipart/form-data* requests ase binary type
and parse it into base64 format.

Another important parameter is:
```yaml
  DefinitionUri: ./swagger.yaml
```
which points to the file where the API documentation is defined. In this file
one can configure API Gateway, the input and output models.
For example, the following part tell API Gateway to parse all media types as
binary files and use `aws_proxy`, which means that AWS lambda would be formatting outputs:
```yaml
  # For AWS Integration
  x-amazon-apigateway-request-validators:
    basic:
      validateRequestParameters: true
  x-amazon-apigateway-binary-media-types:
    - '*/*'
  x-amazon-apigateway-integration:
    type: "aws_proxy"
    httpMethod: "POST"
    # Replace AWS_REGION and ACCOUNT_ID in uri
    uri: "arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:{AWS_REGION}:{ACCOUNT_ID}:function:MatchvecFunction/invocations"
```

### AWS Lambda function

The lambda configuration includes:
* **Handler**: points to the function that will serve as an entrypoint.
* **Runtime**: python version to be used.
* **Layers**: Dependencies to be used in order to execute the lambda function.
* **Events**: Tells the route to be requested and the path parameters in it.

## Developing with PyTest

Lambda functions run on the cloud, which means that you need to push your code
each time you want to deploy it. This can be annoying when you are debugging
and making iterations with your code. 

A good way that we have found is to mimic the lambda behaviour locally and testing with it.
Once again the library [request toolbelt](https://github.com/requests/toolbelt)
provides a useful functions request behaviour. The `MultipartEncoder` can
encode files or images in binary format and it can be converted to string
`base64` format. The request to lambda function is called an event, which is a
python *dict* structure.

The response of the function can be verified using python `assert` function.
In our case, we create simple test cases from the status code and the content of the body.

```python
mp_encoder = MultipartEncoder(
    fields={'field0': open("tests/clio4.jpg", "rb")}
)
body = mp_encoder.to_string()
event = dict(httpMethod = 'POST',
             path = '/predict',
             headers = {'Content-Type': mp_encoder.content_type},
             body = body)
resp = lambda_handler_classification(event, None)
body = resp['body']
assert resp['statusCode'] == 200
print(body)
assert any(['CLIO' in vehicule['label'] for vehicule in eval(body)[0] + eval(body)[1]]), 'There is no clio in predictions %s'%body
assert any(['BMW SERIE 5' in vehicule['label'] for vehicule in eval(body)[0] + eval(body)[1]]), 'There is no bmw in predictions %s'%body
```

These test can be added to the test folder and launched with PyTest. A good
practice is also to automate testing using github actions, in order to launch
a lint tool and testing for each push to the repository. You can take a look at [our test github action](https://github.com/ia-flash/matchvec/blob/master/.github/workflows/python.yml).

## Conclusions

Automating the deployment process for lambda function is a complete relief:
* Deploying your function is as simple as a git push
* Development environment is the same as the production environment
* Tests are a guarantee that your code will work

This comes also with serverless advantages: You don't have to worry about server maintenance and scalability! 

In addition most serverless providers have very interesting economic prices:
AWS for example gives 3 millions of requests by month for free if your function
uses less than 128 ram memory.

However there is always a price to pay:
* There are size constraints, in AWS, the dependencies can't me more than 250mb and each layer can't be larger that 50mb.
* There is no cache in your function. So the cold start, can affect the
  response time if you need to fetch information (like a deep learning model)
  before answering the request.
