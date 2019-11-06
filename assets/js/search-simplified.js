/* global instantsearch */

const search = instantsearch({
  appId: 'Z1GMX6PWB9',
  apiKey: 'fa7e5223f22e6988eb1f12a16f14a0af',
  indexName: 'cristianpb',
  searchParameters: {
    hitsPerPage: 6,
  }
});

// 1. Create a render function
const renderRefinementList = (renderOptions, isFirstRender) => {
  const {
    items,
    isFromSearch,
    refine,
    createURL,
    isShowingMore,
    canToggleShowMore,
    searchForItems,
    toggleShowMore,
    widgetParams,
  } = renderOptions;

  if (isFirstRender) {
    const div = document.createElement('div');
    const button = document.createElement('button');
    button.textContent = 'Show more';
    button.classList.add('button');
    button.classList.add('is-fullwidth');

    button.addEventListener('click', () => {
      toggleShowMore();
    });

    widgetParams.container.appendChild(div);
    widgetParams.container.appendChild(button);
  }

  widgetParams.container.querySelector('div').innerHTML = items
    .map(
      item => `
          <a
            class="button is-fullwidth ${item.isRefined ? 'is-info' : 'is-white'}"
            href="${createURL(item.value)}"
            data-value="${item.value}"
            style="font-weight: ${item.isRefined ? 'bold' : ''}"
          >
            ${item.label} (${item.count})
          </a>
      `
    )
    .join('');

  [...widgetParams.container.querySelectorAll('a')].forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      refine(event.currentTarget.dataset.value);
    });
  });

  const button = widgetParams.container.querySelector('button');

  button.disabled = !canToggleShowMore;
  button.textContent = isShowingMore ? 'Show less' : 'Show more';
};

// 2. Create the custom widget
const customRefinementList = instantsearch.connectors.connectRefinementList(
  renderRefinementList
);

// 3. Instantiate
search.addWidgets([
  customRefinementList({
    container: document.querySelector("#refinement-tags"),
    attributeName: "tags",
    showMoreLimit: 20
  })
]);

// Categories
search.addWidgets([
  customRefinementList({
    container: document.querySelector("#refinement-categories"),
    attributeName: "categories",
    showMoreLimit: 20
  })
]);

// Create the render function
const renderPagination = (renderOptions, isFirstRender) => {
  const {
    pages,
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine,
    createURL,
  } = renderOptions;

  const container = document.querySelector('#pagination');
  let previous_button = (currentRefinement > 0) ? `<a href="href="${createURL(currentRefinement - 1)}" data-value="${currentRefinement - 1}" class="button">← Previous page</a>&nbsp;`: ''
  let next_button = ((currentRefinement + 1) < nbPages) ? `<a href="${createURL(currentRefinement + 1)}" data-value="${currentRefinement + 1}" class="button">Next page →</a>` : ''
  let first_page = (currentRefinement > 1) ?  `<li><a class="pagination-link"  href="${createURL(0)}" data-value="${0}"
  aria-label="Goto page 1">1</a></li> <li><span class="pagination-ellipsis">&hellip;</span></li>`: ''
  let previous_page = (currentRefinement > 0) ?  `<li><a class="pagination-link"  href="${createURL(currentRefinement - 1)}" data-value="${currentRefinement - 1}"
  aria-label="Goto page 1">${currentRefinement}</a></li>`: ''
  let next_page = ((currentRefinement + 1) < nbPages) ? `
            <li><a class="pagination-link" href="${createURL(currentRefinement + 1)}" data-value="${currentRefinement + 1}" aria-label="Goto last page">${currentRefinement + 2}</a></li>` : ''
  let last_page = ((currentRefinement + 2) < nbPages) ? `<li><span class="pagination-ellipsis">&hellip;</span></li>
            <li><a class="pagination-link" href="${createURL(nbPages - 1)}" data-value="${nbPages - 1}" aria-label="Goto last page">${nbPages}</a></li>` : ''

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <nav class="pagination is-centered" role="navigation" aria-label="pagination">` + previous_button + next_button + `
          <ul class="pagination-list">` + first_page + previous_page + `
            <li><a class="button is-link" aria-label="Page ${currentRefinement}" aria-current="page">${currentRefinement + 1}</a></li>`  + next_page + last_page + `
          </ul>
        </nav>
      </div>
    </section>
  `;

  [...container.querySelectorAll('a')].forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      refine(event.currentTarget.dataset.value);
    });
  });
};

// Create the custom widget
const customPagination = instantsearch.connectors.connectPagination(
  renderPagination
);

// Instantiate the custom widget
search.addWidgets([
  customPagination({
    container: document.querySelector('#pagination'),
  })
]);

// Listen changes from input element
search.addWidget({
  init: function(opts) {
    const helper = opts.helper;
    const input = document.querySelector('#searchBox');
    input.addEventListener('input', function(e) {
      helper.setQuery(e.currentTarget.value) // update the parameters
            .search(); // launch the query
    });
  }
});

function date_unix_str(date_unix) {
  const date = new Date(date_unix*1000);
  // Year
  const year = date.getFullYear();
  // Month
  const months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months_arr[date.getMonth()];
  // Day number 
  const day = date.getDate();
  const formattedTime = month + ' ' + day + ', ' + year;
  return formattedTime
}

// Render results in hits element
search.addWidget({
  render: function(opts) {
    const results = opts.results;
    // read the hits from the results and transform them into HTML.
    document.querySelector('#hits').innerHTML = results.hits.map(function(h) {
      let formattedTime = date_unix_str(h.date);
      let external_tag = ('link' in h) ? `<span class="tag is-danger"><i class="fas fa-external-link-alt"></i></span>`: '' ;
      let img_template = '';
      if ('image' in h) {
        img_template = `
      <div class="card-image">
        <figure class="image">
          <a href="${('link' in h) ? h.link : h.url}">
            <center>
              <amp-img src="${h.image.path}" width="368" height="245" alt="${h.title}" layout="intrinsic"></amp-img>
            </center>
          </a>
        </figure>
      </div>`
      } 

      return `
    <div class="column is-one-third">
      <div class="card">` + img_template  + `
        <div class="card-content">
          <div class="media apretaito">
            <div class="media-content">
              <a href="${('link' in h) ? h.link : h.url}" ${('link' in h) ? "target=\"_blank\"" : ''} class="title is-4">${h.title}</a>
            </div>
          </div>
          <div class="content apretaito">
            <p>
              ${h.description}
            </p>
            <div class="tags has-addons">
              <span class="tag">
                <i class="fas fa-calendar-alt"></i>&nbsp;${ formattedTime }
              </span>
              <span class="tag is-link">
                ${ h.categories.join(", ")}
              </span>` + external_tag + `
            </div>
          </div>
        </div>
      </div>
    </div>`
    }).join('');
  }
});

search.start();
