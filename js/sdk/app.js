

const apigClient = apigClientFactory.newClient();

function uploadPhoto() {
    console.log("=================== UPLOADING ====================++++");
    const fileInput = document.getElementById('photoFile');
    const labelsInput = document.getElementById('customLabels');
    const file = fileInput.files[0];
    const customLabels = labelsInput.value || '';

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const binaryData = event.target.result;

        const params = {
            filename: file.name, 
            'x-amz-meta-customLabels': customLabels // add customLabels here
        };

        const additionalParams = {
            headers: {
                'Content-Type': 'application/octet-stream',  // Correct content type (image/png, etc.)
                'x-amz-meta-customlabels': customLabels // correctly passed as header
            }
        };

        console.log("Sending request with params:", params);
        console.log("Content-Type:", file.type);
        console.log("Custom labels:", customLabels);

        apigClient.uploadPut(params, binaryData, additionalParams)
            .then(result => {
                console.log("✅ Upload successful:", result);
                alert("Photo uploaded successfully!");
            })
            .catch(error => {
                console.error("❌ Upload failed:", error);
                if (error.response) {
                    console.error("Error status:", error.response.status);
                    console.error("Error data:", error.response.data);
                }
                alert("Upload failed. See console for details.");
            });
    };
    reader.readAsArrayBuffer(file);
}



function searchPhotos() {
    console.log("=================== SEARCHING ====================");
    const query = document.getElementById('searchQuery').value.trim();

    if (!query) {
        alert("Please enter a search query.");
        return;
    }

    const params = { q: query };

    apigClient.searchGet(params, {}, {})
        .then(response => {
            console.log("✅ Search response:", response);

            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            const photoData = response.data;

            if (photoData.image_data_base64) {
                const img = document.createElement('img');
                img.src = `data:${photoData.content_type};base64,${photoData.image_data_base64}`;
                img.alt = photoData.filename;
                resultsDiv.appendChild(img);
            } else if (photoData.message) {
                resultsDiv.innerHTML = `<p>${photoData.message}</p>`;
            } else {
                resultsDiv.innerHTML = "<p>No image found.</p>";
            }
        })
        .catch(error => {
            console.error("❌ Search failed:", error);
            alert("Search failed.");
        });
}
