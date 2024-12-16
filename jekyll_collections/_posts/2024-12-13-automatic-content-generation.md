---
layout: post
title: 'Artificial Content Generation'
date: 2024-12-07
description: This articles presents how to generate content using large language and vision models. The content is then shared websites and social networks.
categories:
  - data science
tags: 
 - python
 - llm
image:
  path: /assets/img/automatic-content-generation/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/automatic-content-generation/main-thumb.jpg
  height: 225
  width: 400
#video: true
ligthbox: true

---

In today's digital age, creating artificial content has become simpler than ever before, thanks to advancements in technology and AI tools. This type of strategy can be an effective way to capture the attention of users and convey a particular message or idea. 

For example, businesses and marketers can use AI-generated images or videos to create engaging content that stands out on social media platforms or other digital channels. These visuals can be tailored to specific audiences or trends, making them more likely to resonate with users and generate engagement. 

However, it's important to note that while artificial content can be effective in capturing attention, it should always be used ethically and responsibly. Businesses should ensure that their use of AI tools is transparent and clearly disclosed to users, and that they are not attempting to deceive or mislead their audience in any way. 

Furthermore, while artificial content can be an effective tool for capturing attention, it's only one piece of the puzzle when it comes to creating a successful digital marketing strategy. Businesses should also focus on creating high-quality content that provides value and relevance to their audience, as well as optimizing their site's user experience and overall performance. 

## Text Generation

When it comes to utilizing large language models (LLMs), there are typically two routes you can take: self-hosted models or available APIs. Self-hosting allows for greater customization and control, but also requires more technical expertise and resources. On the other hand, using an API provided by a service like OpenAI is often more convenient, as they offer a pre-built wrapper to call different models. One such example is OpenAI's API, which enables users to easily access various LLMs with a single interface. 

Another option for those looking to utilize LLMs without the need for self-hosting or paying for access is Groq.ai, which offers a free model for use. This can be an attractive option for those who want to experiment with LLMs without incurring any costs. 

Once you have selected your preferred method of accessing an LLM, the following Python code example demonstrates how to query the model and obtain a text response: 


```python
client = OpenAI(
    # Groq API
    base_url="https://api.groq.com/openai/v1",
    api_key=GROQ_API_KEY
    # local instance
    # base_url = 'http://localhost:11434/v1',
)

def get_message(publication_date):
    content = (
        "Generate content for a web post about NERF the output has to be in markdown format, "
        "the text starts with a title, a number signs (#), then a newline sign (\n), for example \'# Celebrate Winter with Nerf\n\', "
        f"take into account important events that happens on {publication_date} or during that week or month"
    )
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
        {"role": "system", "content": "You are a helpful assistant that writes content."},
        {"role": "user", "content": content},
      ]
    )
    return response.choices[0].message.content
```

If you want to generate text based on a specific date or day of the year, you can use a language model to generate a unique output for each input. Here's an example of how to accomplish this using Python and the popular Pandas library:

```python 
n_posts = 100
df = (
  pd.DataFrame()
  .assign(
    date = (
      pd.to_datetime(
          pd.Series([
            datetime.combine(date(2024,1,1), time(0)) \
            + timedelta(days=i*3.5 + random.random() * 1, hours=random.random()*24) \
            for i in range(n_posts)
          ])
      )
      .dt.strftime('%Y-%m-%d %H:%M')
    ),
    message = lambda x: (
      x['date'].progress_apply(lambda x: \
        get_message(pd.to_datetime(x).strftime('%B %-dth'))
        )
    )
  )
)
```

Below are some results of the generated text.
Is interesting to notice that the models are able to relate date with events like winter, women’s day, Halloween, between others.

```yaml
january: 'Get Ready to NERF This Winter Season!',
february: 'Celebrate Love and NERF this February',
march: "Celebrate International Women's Day with NERF",
april: 'Celebrate Earth Day with NERF',
may: 'NERF: Celebrating Community and Creativity in May',
june: 'Celebrate Summer with NERF: Fun and Games in June!',
july: '7 Epic Ways to NERF Your Way Through Summer Fun',
august: 'Celebrate National Watermelon Day with NERF Blasters!',
september: 'Celebrate World Noodle Day with NERF',
october: 'Make your Halloween Party Spook-tacular with NERF!',
november: 'Experience Winter Magic with NERF this November!',
december: 'Celebrate Winter with NERF: Fun Activities to Enjoy During the Holiday Season!'
```

## Image generation

There are various API-based language models and self-hosted solutions available for generating images from text inputs. These tools offer powerful capabilities for content creation and can be used for a wide range of applications, such as generating product images, creating art, and visualizing data. 

One popular option is the Midjourney application, which offers endpoints for generating images from text using stable diffusion models. There are developer friendly API like [StabilityAI](https://stability.ai/) which allow to use generate image using simple python code. Users can input text and receive an image in response, making it easy to create custom graphics for websites, social media, and other digital platforms. Additionally, solutions like [Automatic 1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui) or [SwarmUI](https://github.com/mcmonkeyprojects/SwarmUI) allows to self-host a model for more advanced customization and control over the model architecture and training process.

OpenAI also offers a powerful API for generating images from text inputs. Their text2image endpoint takes a text prompt as input and generates a corresponding image using state-of-the-art machine learning algorithms. OpenAI's API is widely used in research and industry and has been applied to a variety of applications, such as generating realistic product images for e-commerce sites and creating custom artwork for digital marketing campaigns. 

Another interesting application of these tools is image2image translation, where the input is an image instead of text. By providing some instructions or guidance to the model, users can determine the output image result. For example, a user might provide an image of a landscape and ask the model to add a sunset or change the season. This capability has many potential applications in fields such as graphic design, gaming, and virtual reality. 

```python
def gen_image(prompt, output_name, seed):
    prompt = "(best quality:1.2), (masterpiece:1.2) (realistic:1.2), (intricately detailed:1.1) " +  prompt
    payload = {
        "prompt": prompt,
        "seed": seed,
        "batch_size": 1,
        "width": 1024,
        "height": 1024,
        "steps" : 50,
        "hr_scale": 2,
        "refiner_switch_at": 0.8,
        "refiner_checkpoint": "sd_xl_refiner_1.0.safetensors",
        "negative_prompt": "bad quality, blur, anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured",
    }

    # For StabilityAI
    # url = f"https://api.stability.ai/v1/generation/{engine_id}/text-to-image",
    # For self hosted AUTOMATIC1111
    # url = http://localhost:7860/sdapi/v1/txt2img
    response = requests.post(url="url", json=payload)
    r = response.json()

    if 'images' in r:
        # Decode and save the image.
        with open(f"images/raw/{output_name}.png", 'wb') as f:
            f.write(base64.b64decode(r['images'][0]))
```

When generating images from text inputs, it's important to keep in mind that the results may not always match your expectations. While language models can capture relevant information and use it to generate coherent and contextually appropriate text or images, they are not perfect and may sometimes produce unexpected output. 

For example, when attempting to generate cute content containing little puppies and Nerf toys using a simple prompt, the results may vary depending on the specific language model used and the input provided. While some models may be able to capture the desired concept and generate images that include both puppies and Nerf toys, others may only incorporate one or the other, or produce output that is unrelated to the prompt altogether. 

To increase the likelihood of generating images that match your desired concept, it's important to provide clear and specific instructions to the language model. This might involve breaking down the concept into smaller components or providing multiple prompts to ensure that all relevant elements are included. Additionally, experimenting with different models and input parameters can help improve the quality and consistency of the generated images. 

It's also worth noting that language models may not always be able to capture the nuances of human creativity and imagination. While they can generate coherent and contextually appropriate text or images based on a given prompt, they may struggle to produce truly unique or unexpected content. Nonetheless, these tools can be a powerful resource for generating creative and engaging content, particularly when used in conjunction with other design and editing tools. 

<div class="columns is-mobile is-multiline is-horizontal-center">
<div class="column is-6-desktop is-12-mobile">
<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="puppynonerf"
  alt="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  title="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  src="/assets/img/automatic-content-generation/20241122OnNov.22ndasprypupnimblydodgesNerfblastsinthecoolautumnair._0.jpg"
  layout="responsive"
  width="737"
  height="697"></amp-img>
<div id="puppynonerf">
  Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air
</div>
</div>
<div class="column is-6-desktop is-12-mobile">
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="puppycollar"
  alt="markdown html output"
  title="markdown html output"
  src="/assets/img/automatic-content-generation/20240219OnFeb19thamischievouspuppyevadesmultipleNerfblastershotsinthesnowcoveredparkleaving_1.jpg"
  layout="responsive"
  width="737"
  height="697"></amp-img>
<div id="puppycollar">
  Prompt: On Feb 19th a mischievous puppy evades multiple Nerf blaster shots in the snow covered park
</div>
</div>
</div>

To improve the quality of generated images using language models, attention emphasis can be employed. This technique involves adjusting the input prompt to emphasize or de-emphasize certain elements, resulting in output that better matches the desired concept. 

One approach is to reorder the words in the input prompt, with those appearing first having the greatest impact on the generated image. For example, if generating an image of a dog playing with a ball, placing "dog" before "ball" in the prompt may result in an image that features the dog more prominently than the ball. This method is highly flexible and can be used to emphasize any element of the prompt, but it does not lend itself to algorithmic modification, as changing the order of words requires manual input. 

Another approach is to use parenthetical tokens to adjust the attention by a given amount. For example, "(dog:2)" might result in an image that features the dog more prominently than other elements of the prompt, while "(ball:-1)" might de-emphasize the ball. This method allows for a great deal of nuance and fine-tuning, but it comes with some caveats. Specifically, using too many parenthetical tokens or values that are too large can introduce artifacts in the generated image, making it less coherent or realistic. 

It's also possible to use extra parentheses to strengthen a subject or brackets to weaken it instead of providing a value. For example, "(dog)" might result in an image that features the dog more prominently than other elements of the prompt, while "[ball]" might de-emphasize the ball. However, this method can also introduce artifacts if used excessively or with large values. 


<div class="columns is-mobile is-multiline is-horizontal-center">
<div class="column is-6-desktop is-12-mobile">
<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="nerfpuppy"
  alt="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  title="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  src="/assets/img/automatic-content-generation/2025-10-24-AplayfulpuppydeftlydodgescolorfulNerfdartsinthebac_0.jpg"
  layout="responsive"
  width="737"
  height="697"></amp-img>
<div id="nerfpuppy">
  Prompt: A playful puppy dodges colourful ((Nerf)) darts in the back of a garden
</div>
</div>
<div class="column is-6-desktop is-12-mobile">
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="nerfaccent"
  alt="markdown html output"
  title="markdown html output"
  src="/assets/img/automatic-content-generation/20240826CelebrateSummerwithNERF_1.jpg"
  layout="responsive"
  width="737"
  height="697"></amp-img>
<div id="nerfaccent">
  Prompt: On a afternoon of September a puppy plays with a ((Nerf)) blaster
</div>
</div>
</div>



## Writing markdown text

When generating content using language models, it's often desirable to format that content for inclusion on a static website generator. One way to do this is by converting the content to Markdown format, which allows for easy formatting and customization. 

Markdown is a lightweight markup language that enables users to add formatting such as headers, lists, and links using simple syntax. By converting generated content to Markdown format, users can ensure that it displays consistently across different platforms and devices, making it ideal for use on static website generators. 

To convert content to Markdown format, users can simply wrap the text in Markdown syntax, such as using "#" for headers or "-" for bullet points. This enables easy formatting and customization of the generated content, allowing users to add links, images, and other elements as needed. 

Additionally, many language models offer built-in support for generating Markdown-formatted text directly, eliminating the need for manual conversion. By specifying the desired output format as Markdown, users can generate content that is ready for inclusion on a static website generator with minimal additional formatting required. 


```python
def get_header(title, post_date, coverimage):
    header = f"""---
title: "{title}"
date: "{post_date}"
updated: "{post_date}"
categories:
  - "nerfs"
coverImage: "/images/posts/{coverimage}"
coverWidth: 16
coverHeight: 16
excerpt: Check out how heading links work with this starter in this post.
---
"""
    base_dep = """
<script>
  import { base } from '$app/paths';
</script>
"""
    return header + base_dep

def write_markdown(idx, title, post_date, message, coverimage):
    markdown_text = get_header(title, post_date, coverimage.replace('-', '') + "_1.jpg") + message
    with open(f"../src/lib/posts/{coverimage}.md", 'w') as f:
        f.write(markdown_text)
```

Once generated content has been processed using language models and formatted for display, it can be rendered in HTML format for use on static website generators or other platforms. This involves converting the content into HTML code that includes various elements such as headers, paragraphs, and images to create a visually appealing layout. 

To capture the viewer's attention and provide context for the content, it's common to include a main image at the beginning of the generated content. This might involve selecting an image that is both relevant to the topic and visually engaging, as well as ensuring that it displays correctly on different devices and screen sizes. 

Following the main image, text content can be developed with additional images included throughout the text to break up the content and provide visual interest. Including multiple images in this way helps to keep the viewer engaged and interested in the generated content, while also providing context and information through accompanying text. 

When creating HTML code from generated content, it's important to consider factors such as responsive design, which ensures that the layout adapts to different screen sizes and devices. Additionally, using semantic markup can help search engines understand the structure and meaning of the content, improving its visibility and discoverability. 

<center>
<amp-img src="/assets/img/automatic-content-generation/Screenshot_nerf_website.jpg" alt="nerf application webpage" height="562" width="323" layout="intrinsic"></amp-img>
<br><i>Nerf application webpage, the website is 👉</i>  <a href="https://cristianpb.github.io/nerf">here</a>
</center>

## Posting content in social networks

Twitter offers a free API (Application Programming Interface) that enables users to programmatically post messages to the platform. This API is a powerful tool for developers, as it provides access to various features and functionalities of Twitter's platform. 

One key feature of the Twitter API is its rate limit, which specifies the number of requests that can be made within a given time period. For the free version of the API, this rate limit is set to 17 requests per hour. This means that developers must carefully manage their use of the API to avoid exceeding the limit and facing restrictions or penalties. 

To make the most of the Twitter API's rate limit, it's important to optimize requests by combining multiple actions into a single request where possible. Additionally, scheduling requests during off-peak hours can help ensure that the rate limit is not exceeded and that messages are posted successfully. 

In some cases, developers may need to upgrade to a paid version of the Twitter API to access higher rate limits and more advanced features. However, for many use cases, the free version of the API provides sufficient functionality and flexibility. 

Remeber to configure the writing permissions in order to use the posting endpoints of the API.

<center>
<amp-img src="/assets/img/automatic-content-generation/twitter_app_permissions.jpg" alt="twitter developper app permissions" height="407" width="548" layout="intrinsic"></amp-img>
<br><i>X developper app permissions</i>
</center>



To increase visibility and reach on social media platforms, it's important to stay up-to-date with current trends and topics that are popular among users. One strategy for doing this is to use trending subjects as inspiration for creating content, such as short messages or posts that incorporate relevant keywords and hashtags. 

For example, the following code demonstrates how to create short messages using Google Trends subjects: 


```python
from pytrends.request import TrendReq

pytrend = TrendReq()
df = pytrend.trending_searches(pn='france').rename(columns={0: 'daily trends'})
df.head()

def gen_prompt(subject):
    return (
        f"Describe a controversial situation about {subject}, involving nerf blasters, shooting nerf darts.  "
    )
df['message'] = (
    df['daily trends']
    .progress_apply(lambda x: get_message(
       prompt=gen_prompt(x),
       assistant_instructions=(
            "You are a helpful assistant that writes prompts to generate realistic images. "
            "Use only simple words, no hashtags. Detailled description of the situation but keep it short, no more than 150 characters."
       )
     )
   )
)
```

Once content has been generated using trending subjects or other sources, it's important to distribute and promote that content on relevant social media platforms. This can help increase visibility, engagement, and reach among target audiences. 

The following code demonstrates how to use the Twitter API to post a message with an image: 
 

```python
import tweepy

def post_on_twitter(tweet, image=None):
    auth = tweepy.OAuthHandler(api_key, api_key_secret)
    auth.set_access_token(access_token, access_token_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True)
    client = tweepy.Client(
            bearer_token=bearer_token,
            consumer_key=api_key,
            consumer_secret=api_key_secret,
            access_token=access_token,
            access_token_secret=access_token_secret
            )

    # Upload image
    if image is not None:
        media = api.media_upload(image)
        # Create a tweet
        post_result = api.update_status(status=tweet, media_ids=[media.media_id])
    else:
        post_result = api.update_status(status=tweet)
    print("Tweet posted successfully.")
```

Here are some examples of the content that can be produced.
While AI-generated images may not be perfect, they can still be effective in capturing attention and conveying a message. However, there may be some small artifacts or imperfections that suggest the image is not entirely real, such as excessive numbers of limbs or unusual body positions. 

Despite these minor imperfections, AI-generated images can still be an effective tool for content creation and distribution on social media platforms. By leveraging tools like DALL-E, brands and marketers can quickly generate high-quality visuals that help capture attention and convey a message in a unique and engaging way. 


<div class="columns is-mobile is-multiline is-horizontal-center">
<div class="column is-6-desktop is-12-mobile">
<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  alt="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  title="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  src="/assets/img/automatic-content-generation/post_x1.jpg"
  layout="responsive"
  width="535"
  height="598"></amp-img>
</div>

<div class="column is-6-desktop is-12-mobile">
<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  alt="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  title="Prompt: On nov 22nd a puppy dodge Nerf blast in the cool autumn air"
  src="/assets/img/automatic-content-generation/post_x3.jpg"
  layout="responsive"
  width="535"
  height="598"></amp-img>
</div>

</div>
<div class="columns is-mobile is-multiline is-horizontal-center">


<div class="column is-6-desktop is-12-mobile">
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  alt="markdown html output"
  title="markdown html output"
  src="/assets/img/automatic-content-generation/post_x2.jpg"
  layout="responsive"
  width="535"
  height="598"></amp-img>
</div>


<div class="column is-6-desktop is-12-mobile">
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  alt="markdown html output"
  title="markdown html output"
  src="/assets/img/automatic-content-generation/post_x4.jpg"
  layout="responsive"
  width="535"
  height="598"></amp-img>
</div>

</div>



## Artifical Traffic Augmentation 

To improve website referencing and increase search engine rankings, there are several strategies that businesses and marketers can employ. One of the most effective is to focus on driving traffic to the website using reputable search engines like Google or Bing. By increasing the volume and quality of traffic to the site, businesses can signal to search engines that their content is valuable and relevant to users. 

One strategy for simulating traffic to a website is to use Python tools like Selenium. Selenium is an open-source web automation framework that allows developers to control web browsers programmatically and automate tasks. With Selenium, businesses can execute analytics code like Matomo or Google Analytics, which can help track user behavior and provide insights into how to improve the site's performance and user experience. 

One of the key benefits of using Selenium for web automation is its ability to execute client-side content like JavaScript. This can be particularly useful for websites that rely heavily on JavaScript for functionality or dynamic content. By controlling a web browser programmatically, Selenium can simulate real user behavior and help ensure that all aspects of the site are functioning properly. 

In addition to improving website referencing and analytics, Selenium can also be used for a variety of other tasks related to web automation. For example, businesses can use Selenium to automate repetitive tasks like form filling or data entry, which can help save time and reduce errors. They can also use Selenium to test their website's functionality across different browsers and devices, ensuring that it is accessible and user-friendly for all visitors. 


```python
import time
from selenium import webdriver
while True:
    driver = webdriver.Firefox()
    driver.get("https://url.com")
    scheight = .1
    while scheight < 9.9:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/%s);" % scheight)
        scheight += .01
    time.sleep(10)
    driver.close()
    time.sleep(2)
```

Tracking the analytics of a website is an essential task for businesses and marketers looking to optimize their online presence and drive more traffic to their site. There are many tools available for tracking website analytics, but one of the most popular and widely used is Google Analytics. By integrating Google Analytics into their website, businesses can gain valuable insights into user behavior, demographics, and engagement metrics. 

The following image shows an example of how simulated traffic can impact website metrics in Google Analytics. In this example, the traffic to the site increased from zero to several thousand visitors within a short period of time, thanks to the use of a web automation tool like Selenium. This type of sudden increase in traffic can be a strong signal to search engines that the site's content is valuable and relevant to users, which can help improve its search engine rankings and visibility. 

It's important to note, however, that simulated traffic should be used responsibly and ethically. While it can be an effective way to improve website analytics and search engine rankings, it's not a substitute for genuine user engagement and interaction. Businesses should focus on creating high-quality content and optimizing their site's user experience to encourage real users to visit and engage with their site. 

In addition to tracking traffic and user behavior, Google Analytics can also provide valuable insights into other metrics like bounce rate, conversion rate, and demographics. By analyzing these metrics over time, businesses can identify trends and patterns in user behavior and make data-driven decisions about how to improve their site's performance and user experience. 

<center>
<amp-img src="/assets/img/automatic-content-generation/google_analytics_stats.jpg" alt="google analytics results" height="220" width="562" layout="responsive"></amp-img>
<br><i>Google analytics results with traffic increase</i>
</center>

## Conclusion

The strategies outlined earlier in this conversation can be useful for creating artificial content, which can be employed for a variety of purposes, including commercial use or spreading awareness about a particular ideology. However, it's important to be aware that such content exists in the digital realm and to exercise caution when engaging with it. 

With the rise of AI tools and other technology, generating artificial content has become more accessible than ever before. While this can present opportunities for businesses and marketers looking to create engaging content, it also raises ethical concerns about transparency and honesty in digital communication. 

It's crucial for users to be able to distinguish between what is real and what is not when interacting with digital content. This means that businesses and marketers should be transparent about their use of AI tools and ensure that their messaging is clear and accurate. 

Moreover, while artificial content can be an effective tool for capturing attention, it's only one aspect of a successful digital marketing strategy. Businesses should also focus on creating high-quality content that provides value and relevance to their audience, as well as optimizing their site's user experience and overall performance. 
