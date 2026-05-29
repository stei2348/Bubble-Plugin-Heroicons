function(instance, context) {
    // 1. Marker visuale (Visibile solo in editor, sparisce poi)
    instance.canvas.html("<div style='width:100%; height:100%;");

    // Timeout per dare tempo a Bubble di disegnare il DOM
    setTimeout(() => {
        var pluginElement = instance.canvas[0];
        
        // CACCIA AL GRUPPO: Cerchiamo il più vicino genitore che sia un Gruppo Bubble reale
        // Questo salta i wrapper inutili e va dritto al punto
        var targetGroup = pluginElement.closest('.bubble-element.Group');
        
        if (targetGroup) {
            // Trovato! Lo marchiamo come Header
            targetGroup.classList.add('pdf-element-footer');
            
            // Passiamo i dati per le pagine (Only/Avoid)
            if (instance.data.only) targetGroup.dataset.pdfOnly = instance.data.only;
            if (instance.data.avoid) targetGroup.dataset.pdfAvoid = instance.data.avoid;
            
            // NASCONDIAMO IL PLUGIN STESSO
            // Non vogliamo che il quadratino "20x20" occupi spazio dentro l'header reale
            // Nascondiamo il contenitore diretto del plugin, non il gruppo header!
            var pluginWrapper = pluginElement.closest('.bubble-element') || pluginElement;
            if (pluginWrapper && pluginWrapper !== targetGroup) {
                 // Controlliamo di non nascondere l'header stesso per sbaglio
                 pluginElement.style.display = 'none';
            }
            
            console.log("PDF Plugin: Header Group agganciato correttamente", targetGroup);
        } else {
            console.warn("PDF Plugin: ATTENZIONE - Nessun Gruppo padre trovato per l'Header.");
        }
    }, 1000);
}