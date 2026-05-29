function(instance, properties, context) {
    // Richiama la funzione definita nell'initialize
    if (instance.data.generatePDF) {
        instance.data.generatePDF(properties);
    } else {
        console.error("PDF Plugin: generatePDF function not initialized yet.");
    }
}