
var resultText;
const search = document.querySelector('#submit');
const searchQuery = document.querySelector('#searchQuery');
const results = document.querySelector('#results');
const res_blk = document.querySelector('#res_blk');
const err_blk = document.querySelector('#err_blk');
const sel_img_blk = document.querySelector('#sel_img_blk');
const sel_img_lbl = document.querySelector('.sel_img_lbl');
const var_img_lbl = document.querySelector('.var_img_lbl');
const carousel_indicators = document.querySelector('#carousel_indicators');
const carousel_items = document.querySelector('#carousel_items');
const loader = document.querySelector('#loader');
const openAiUrl = 'https://api.openai.com/v1/images/variations';
const headers = {
  "Authorization": `Bearer ${window.OPEN_AI_KEY}`
}

searchQuery.addEventListener('change', function() {
  const files = searchQuery.files[0];
  // debugger;
  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    fileReader.addEventListener("load", function () {
      console.log(this.result)
      sel_img_lbl.classList.remove('d-none');
      sel_img_blk.classList.remove('d-none');
      sel_img_blk.innerHTML = '<img src="' + this.result + '" class="d-block w-100" />';
    });
  }
})
search.addEventListener('click', function() {
  if(!searchQuery.files.length) { return }
  getCompletions();
})

async function getCompletions() {
  loader.classList.remove('d-none');
  answer.classList.add('d-none');
  res_blk.classList.add('d-none');
  resultText = null;
  err_blk.classList.add('d-none');
  err_blk.innerHTML = null;
  const form = new FormData();
  form.append('image',  searchQuery.files[0]);
  form.append('n', 10);
  form.append('response_format',  'b64_json');
  form.append('size', "1024x1024");

  const dataObj = {
    method: 'POST',
    cache: 'no-cache',
    headers: headers,
    referrerPolicy: 'no-referrer',
    body: form
  }

  try {
    const response = await fetch(openAiUrl,dataObj)
    const responseData = await response.json();
    console.log(responseData)
    if(responseData?.error?.message) { throw responseData?.error }
    const thumbData = responseData.data.map((element, i) => {
      const image_url = 'data:image/png;base64,' + element.b64_json;
      return  `
      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${i}" class="w-100 active h-100" aria-current="true" aria-label="Slide ${i}"><img src="${image_url}" class="d-block w-100 h-100" alt="..."></button>
      `
    }).join('');

    const carouselData = responseData.data.map((element, i) => {
      const image_url = 'data:image/png;base64,' + element.b64_json;
      return  `
      <div class="carousel-item ${i == 0 && 'active'}">
        <img src="${image_url}" class="d-block w-100 m-auto" alt="...">
        <a role='button' onclick='downloadImg("${image_url}")'><span class='position-absolute download-icon'><span class="mdi mdi-arrow-down-bold-circle-outline" id="mdi"></span></span></a>
        </div>
      `
    }).join('');
    carousel_indicators.innerHTML = thumbData;
    carousel_items.innerHTML = carouselData;
    loader.classList.add('d-none');
    answer.classList.remove('d-none');
    res_blk.classList.remove('d-none');
    var_img_lbl.classList.remove('d-none');
  } catch (error) {
    console.log(error);
    err_blk.classList.remove('d-none');
    err_blk.innerHTML = error.message;
    answer.classList.remove('d-none');
    loader.classList.add('d-none');
  }
}

function downloadImg(url) {
  var fileName = "download.png";
  var tag = document.createElement('a');
  tag.href = url;
  tag.download = fileName;
  document.body.appendChild(tag);
  tag.click();
  document.body.removeChild(tag);
}
