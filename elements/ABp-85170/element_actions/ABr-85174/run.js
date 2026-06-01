function(instance, properties, context) {


fetch(instance.data.GET_LAMBDA(), {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify("")
        }).then(async (response) => {
            if (!response.ok) { 
                const errText = await response.text(); 
                try {
                    const errJson = JSON.parse(errText);
                    throw new Error(errJson.message || `Error ${response.status}`);
                } catch(e) {
                    throw new Error(`Lambda HTTP Error ${response.status}: ${errText}`); 
                }
            }
            return response.json();
        })

}