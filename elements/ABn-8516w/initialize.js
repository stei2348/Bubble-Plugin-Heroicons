function(instance, context) {
    instance.canvas.addClass('pdf-nosplit-marker');
    instance.canvas.html("<div style='border:1px dashed blue; font-size:8px; color:blue; width:100%; height:100%;'>NO SPLIT</div>");

    setTimeout(() => {
        var pluginElement = instance.canvas[0];
        
        // Cerchiamo il Gruppo Bubble reale che contiene questo elemento
        var targetGroup = pluginElement.closest('.bubble-element.Group');

        if (targetGroup) {
            targetGroup.classList.add('pdf-protect-this-group');
            
            // Nascondiamo il quadratino del plugin per pulizia
            pluginElement.style.display = 'none';
            
        } else {
        }
    }, 1000);
}