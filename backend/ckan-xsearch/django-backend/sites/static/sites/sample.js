var api_base = '/api';

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('btn_query');
  if (!btn) {
    return;
  }

  btn.addEventListener('click', function(event) {
    event.preventDefault();

    var payload = new URLSearchParams();
    payload.append('q', document.getElementById('query').value);
    payload.append('fq', document.getElementById('fq').value);
    payload.append('start', document.getElementById('start').value);
    payload.append('rows', document.getElementById('rows').value);

    fetch(api_base + '/package_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: payload.toString()
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log(data);
        var result = data['result'];
        var html = "<ul>\n";
        for (var i in result['results']) {
          var dataset = result['results'][i];
          var show_url = api_base + '/package_show?id=' + dataset['xckan_id'];
          var title = dataset['xckan_title'];
          html += '<li><a href="' + show_url + '"'
               + ' target="_blank">' + title + "<a>";
          html += '<a href="' + dataset['xckan_site_url'] + '" target="_blank"> [' + dataset['xckan_site_name'] + ']</a></li>' + "\n";
        }
        html += "</ul>\n<hr />\n";

        html += '<table id="search_result">';
        html += "<tr><th>Count</th><td>" + result['count'] + "</td></tr>\n";
        html += "<tr><th>Facets</th></td></td></tr>\n";
        for (var key in result['facets']['facet_fields']) {
          html += '<tr><th>' + key + '</th><td>';
          var val = result['facets']['facet_fields'][key];
          for (var j = 0; j < val.length; j += 2) {
            if (j > 0) html += ', ';
            html += val[j] + ':' + val[j + 1];
          }
          html += "</td></tr>\n";
        }

        html += "</table>\n";
        var resultsElem = document.getElementById('results');
        if (resultsElem) {
          resultsElem.innerHTML = html;
        }
      });
  });
});

      
