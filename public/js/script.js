document.getElementById('key-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const shop = queryParams.get('shop');
    const state = queryParams.get('state');

    const region = document.getElementById('region').value;
    const publicKey = document.getElementById('publicKey').value;
    const secretKey = document.getElementById('secretKey').value;
    console.log(shop, state, region, publicKey, secretKey);

    try {
        const response = await fetch(`/api/onboard?shop=${shop}&state=${state}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ region, publicKey, secretKey })
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error:', error);
    }
});

function isValidShopifyURL(shop) {
    const regex1 = /^https?\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\/?/
    const regex2 = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/
    return regex1.test(shop) || regex2.test(shop);
}

function errorModel() {
    var modal = document.getElementById("errorModal");
    var closeBtn = document.getElementsByClassName("close")[0];

    closeBtn.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function showError(msg) {
    document.getElementById('error-ele').innerText = msg;
    document.getElementById("errorModal").style.display = "block";
}

function disableAllField() {
    const region = document.getElementById('region');
    const publicKey = document.getElementById('publicKey');
    const secretKey = document.getElementById('secretKey');
    const submitBtn = document.getElementById('submit-button');
    region.disabled = true;
    publicKey.disabled = true;
    secretKey.disabled = true;
    submitBtn.disabled = true;
    submitBtn.style.backgroundColor = 'gray';
    region.style.cursor = 'not-allowed';
    publicKey.style.cursor = 'not-allowed';
    secretKey.style.cursor = 'not-allowed';
    submitBtn.style.cursor = 'not-allowed';
}

window.onload = async function () {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const shop = queryParams.get('shop');
    const state = queryParams.get('state');

    const region = document.getElementById('region');
    const publicKey = document.getElementById('publicKey');
    const secretKey = document.getElementById('secretKey');
    const submitBtn = document.getElementById('submit-button');

    errorModel();

    if (!state) {
        disableAllField();
        return showError('Invalid Request');
    }
    if (!isValidShopifyURL(shop)) {
        disableAllField();
        return showError('Invalid Shop Url');
    }

    try {
        const jsonData = await fetch(`/api/onboard?shop=${shop}&state=${state}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await jsonData.json();
        console.log(data);
        if (data.status == 'Success') {
            region.value = data.region;
            publicKey.value = data.publicKey;
            secretKey.value = data.secretKey;
            submitBtn.innerText = 'Update';
        }
    } catch (err) {
        console.log(err);
    }
}
