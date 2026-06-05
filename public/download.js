const button = document.getElementById('download_button');
const textbox = document.getElementById('download_url');

function download() {
  window.location.href = '/get_song?url=' + encodeURIComponent(textbox.value);
}

button.addEventListener('click', function(e) {
  download();
});

textbox.addEventListener("keypress", logKey);

function logKey(e) {
    if (e.code === 'Enter') {
        download();
    }
}
