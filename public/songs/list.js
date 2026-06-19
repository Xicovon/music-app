const title_input = document.querySelector("input[name=title-filter]");
const artist_input = document.getElementById('artist-filter');
const album_input = document.getElementById('album-filter');
const year_input = document.getElementById('year-filter');
const title_input_text = document.getElementById('title-filter-text');
const artist_input_text = document.getElementById('artist-filter-text');
const album_input_text = document.getElementById('album-filter-text');
const year_input_text = document.getElementById('year-filter-text');

title_input.addEventListener('change', function(e) {
  console.log('title filter changed');
  filter_list();
});
artist_input.addEventListener('change', function(e) {
  console.log('artist filter changed');
  filter_list();
});
album_input.addEventListener('change', function(e) {
  console.log('album filter changed');
  filter_list();
});
year_input.addEventListener('change', function(e) {
  console.log('year filter changed');
  filter_list();
});

function filter_list() {
  const url = `/songs/list?
    title_filter_null=${encodeURIComponent(title_input.checked)}
    &artist_filter_null=${encodeURIComponent(artist_input.checked)}
    &album_filter_null=${encodeURIComponent(album_input.checked)}
    &year_filter_null=${encodeURIComponent(year_input.checked)}
    &title_filter_query=${encodeURIComponent(title_input_text.value)}
    &artist_filter_query=${encodeURIComponent(artist_input_text.value)}
    &album_filter_query=${encodeURIComponent(album_input_text.value)}
    &year_filter_query=${encodeURIComponent(year_input_text.value)}`;
  window.location.href = url;
}

title_input_text.addEventListener("keypress", logKey);
artist_input_text.addEventListener("keypress", logKey);
album_input_text.addEventListener("keypress", logKey);
year_input_text.addEventListener("keypress", logKey);

function logKey(e) {
    if (e.code === 'Enter') {
        filter_list();
    }
}
