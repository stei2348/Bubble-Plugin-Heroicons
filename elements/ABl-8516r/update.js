function(instance, properties, context) {
    // Salviamo le proprietà in instance.data per l'initialize (o aggiorniamo attributi se già renderizzato)
    instance.data.only = properties.only_pages;
    instance.data.avoid = properties.avoid_pages;
    
    // Se update viene chiamato dopo initialize, aggiorniamo il DOM
    var marker = instance.canvas[0];
    var parent = marker.closest('.bubble-element.Group'); // Rimuoviamo il fallback per brevità qui
    if (parent) {
        if (properties.only_pages) parent.dataset.pdfOnly = properties.only_pages;
        if (properties.avoid_pages) parent.dataset.pdfAvoid = properties.avoid_pages;
    }
}
