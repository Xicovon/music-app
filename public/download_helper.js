console.log('Client-side code running');

const button = document.getElementById('download_button');
button.addEventListener('click', function(e) {
  const textbox = document.getElementById('download_url');
  const url = textbox.value;
  console.log(url);
  window.location.href = '/get_song?url=' + encodeURIComponent(url);
});
