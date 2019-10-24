/* global instantsearch */

const search = instantsearch({
  appId: 'Z1GMX6PWB9',
  apiKey: 'fa7e5223f22e6988eb1f12a16f14a0af',
  indexName: 'cristianpb',
  searchParameters: {
    hitsPerPage: 6,
  }
});

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
  let previous_button = (currentRefinement > 0) ? `<a href="href="${createURL(currentRefinement - 1)}" data-value="${currentRefinement - 1}" class="pagination-previous">← Previous page</a>`: ''
  let next_button = ((currentRefinement + 1) < nbPages) ? `<a href="${createURL(currentRefinement + 1)}" data-value="${currentRefinement + 1}" class="pagination-next">Next page →</a>` : ''
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

search.addWidget({
  render: function(opts) {
    const results = opts.results;
    // read the hits from the results and transform them into HTML.
    document.querySelector('#hits').innerHTML = results.hits.map(function(h) {
      var date = new Date(h.date*1000);
      // Year
      var year = date.getFullYear();

      // Month
      var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var month = months_arr[date.getMonth()];

      // Day
      var day = date.getDate();

      // Will display time in 10:30:23 format
      var formattedTime = month + ' ' + day + ', ' + year;

      let img_template = ('image' in h) ? `
      <div class="card-image">
        <figure class="image">
          <a href="${h.url}">
            <center>
              <amp-img src="${h.image.path}" width="368" height="245" alt="${h.title}" layout="intrinsic"></amp-img>
            </center>
          </a>
        </figure>
      </div>` : ''
      return `
    <div class="column is-one-third">
    <div class="card">
    ` + img_template  + `
      <div class="card-content">
        <div class="media apretaito">
          <div class="media-content">
            <a href="${h.url}" class="title is-4">${h.title}</a>
          </div>
        </div>
        <div class="content apretaito">
          <p>
            ${h.description}
          </p>
          <div class="tags has-addons">
            <span class="tag"><i class="fas fa-calendar-alt"></i>&nbsp;${ formattedTime }</span>
            <span class="tag is-link">${ h.categories.join(", ")}</span>
          </div>
        </div>
      </div>
      
    </div>
    </div>
      `
    }).join('');
  }
});

search.start();
