const button = document.getElementById('submit_button');
button.addEventListener('click', function(e) {
  const filename = document.getElementById('input-filename').value;
  const title = document.getElementById('input-title').value;
  const artist = document.getElementById('input-artist').value;
  const album = document.getElementById('input-album').value;
  const year = document.getElementById('input-year').value;

  // Perform the metadata update logic here
  const url = `/songs/tag?filename=${encodeURIComponent(filename)}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&year=${encodeURIComponent(year)}`;
  window.location.href = url;
});
