document.getElementById("key-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const shop = queryParams.get("shop");
    const state = queryParams.get("state");
    const signature = queryParams.get("signature");

    const region = document.getElementById("region").value;
    const publicKey = document.getElementById("publicKey").value;
    const secretKey = document.getElementById("secretKey").value;
    console.log(shop, state, region, publicKey, secretKey);

    try {
        const response = await fetch(`/api/onboard?shop=${shop}&state=${state}&signature=${signature}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ region, publicKey, secretKey })
        });

        const result = await response.json();
        console.log(result);
        if (result.status == "Success") {
            document.getElementById("submit-button").innerText = "Update";
            enableAllField();
            alert("Successfully Update!");
        } else if (result.status == "Failed") {
            disableAllField();
            return showError(result.message);
        }
    } catch (error) {
        alert("Something Went Wrong!")
        console.error("Error:", error);
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

    // For Closing Error;
    // closeBtn.onclick = function () {
    //     modal.style.display = "none";
    // }

    // window.onclick = function (event) {
    //     if (event.target == modal) {
    //         modal.style.display = "none";
    //     }
    // }
}

function showError(msg) {
    document.getElementById("error-ele").innerText = msg;
    document.getElementById("errorModal").style.display = "block";
}

function disableAllField() {
    const region = document.getElementById("region");
    const publicKey = document.getElementById("publicKey");
    const secretKey = document.getElementById("secretKey");
    const submitBtn = document.getElementById("submit-button");
    region.value = "";
    publicKey.value = "";
    secretKey.value = "";
    submitBtn.innerHTML = "Submit";
    region.disabled = true;
    publicKey.disabled = true;
    secretKey.disabled = true;
    submitBtn.disabled = true;
    submitBtn.style.backgroundColor = "gray";
    region.style.cursor = "not-allowed";
    publicKey.style.cursor = "not-allowed";
    secretKey.style.cursor = "not-allowed";
    submitBtn.style.cursor = "not-allowed";
}

function enableAllField() {
    const region = document.getElementById("region");
    const publicKey = document.getElementById("publicKey");
    const secretKey = document.getElementById("secretKey");
    const submitBtn = document.getElementById("submit-button");
    region.disabled = false;
    publicKey.disabled = false;
    secretKey.disabled = false;
    submitBtn.disabled = false;
    submitBtn.style.backgroundColor = "#007bff";
    region.style.cursor = "pointer";
    publicKey.style.cursor = "text";
    secretKey.style.cursor = "text";
    submitBtn.style.cursor = "pointer";
}

window.onload = async function () {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const shop = queryParams.get("shop");
    const state = queryParams.get("state");
    const signature = queryParams.get("signature");

    const region = document.getElementById("region");
    region.value = "";
    const publicKey = document.getElementById("publicKey");
    const secretKey = document.getElementById("secretKey");
    const submitBtn = document.getElementById("submit-button");

    errorModel();

    if (!state || !signature) {
        disableAllField();
        return showError("Invalid Request");
    }
    if (!isValidShopifyURL(shop)) {
        disableAllField();
        return showError("Invalid Shop Url");
    }

    try {
        const jsonData = await fetch(`/api/onboard?shop=${shop}&state=${state}&signature=${signature}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await jsonData.json();
        console.log(data);
        if (data.status == "Success") {
            enableAllField();
            if (data.region && data.publicKey && data.secretKey) {
                region.value = data.region;
                publicKey.value = data.publicKey;
                secretKey.value = data.secretKey;
                submitBtn.innerText = "Update";
            }
        } else if (data.status == "Failed") {
            disableAllField();
            return showError(data.message);
        }
    } catch (err) {
        alert("Something Went Wrong!")
        console.error(err);
    }
}
