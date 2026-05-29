function(instance, context) {
    
    // --- 1. RECUPERO API KEY DAI SETTINGS DEL PLUGIN ---
    // La chiave viene letta direttamente dal contesto sicuro del plugin
    const GLOBAL_API_KEY = context.keys["MAGIC PDF API KEY"];

    // --- 2. CONFIGURAZIONE URL OFFUSCATA ---
    const _p1 = "aHR0cHM6Ly9ybHpkdHB2cTNqbzZ6Zmd1emJmNXRtY3NybTB4cnNweC5";
    const _p2 = "sYW1iZGEtdXJsLmV1LW5vcnRoLTEub24uYXdzLw==";
    const GET_LAMBDA = () => { try { return atob(_p1 + _p2); } catch(e) { return ""; } };

    instance.data.logHistory = "";
    const addLog = (message) => {
        console.log("PDF Plugin:", message);
        const timestamp = new Date().toLocaleTimeString();
        instance.data.logHistory += `[${timestamp}] ${message}\n`;
        instance.publishState('logs', instance.data.logHistory);
    };

    // --- 3. DEFINIZIONE FUNZIONE PRINCIPALE ---
    instance.data.generatePDF = (properties) => {
        
        // Reset Stati
        instance.publishState('is_generating', true); 
        instance.publishState('error_message', null); 
        instance.publishState('file_url', null);      
        
        const LAMBDA_URL = GET_LAMBDA();
        addLog("Starting process...");

        // --- VALIDAZIONE API KEY ---
        if (!GLOBAL_API_KEY) {
            const errMsg = "Configuration Error: 'MAGIC PDF API KEY' is missing in Plugin Settings.";
            addLog(errMsg);
            instance.publishState('error_message', errMsg);
            instance.publishState('is_generating', false);
            instance.triggerEvent('error');
            context.reportDebugger(errMsg);
            return;
        }

        // Recupero Parametri
        const homeUrl = properties.website_home_url;
        const pageName = properties.page_name;
        
        if (!homeUrl || !pageName) {
            const errMsg = "Error: Missing Website Home URL or Page Name.";
            addLog(errMsg);
            instance.publishState('error_message', errMsg);
            instance.publishState('is_generating', false); 
            instance.triggerEvent('error');
            context.reportDebugger(errMsg);
            return;
        }

        const fileName = properties.file_name || "document.pdf";
        const format = properties.format;
        const customW = properties.custom_width;
        const customH = properties.custom_height;
        const orientation = properties.orientation || "Portrait";
        const quality = properties.quality || 1;
        const magicLink = properties.magic_link;

        // Gestione Timezone Ibrida
        let timezone = properties.timezone;
        let bubbleOffset = properties.bubble_offset_string;

        // Auto-detect Timezone Client-side (se parametri vuoti)
        if ((!timezone || timezone.trim() === "") && (!bubbleOffset || bubbleOffset.trim() === "") && typeof window !== 'undefined') {
            try {
                timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                addLog(`Timezone auto-detected (Client): ${timezone}`);
            } catch (e) {
                const offsetMinutes = new Date().getTimezoneOffset(); 
                bubbleOffset = -(offsetMinutes / 60); 
            }
        }

        const attachTo = properties.attach_to;
        const shouldDownload = properties.download_file;
        const p1 = properties.p1;
        const p2 = properties.p2;
        const p3 = properties.p3;

        // Margini
        const marginTop = properties.margin_top || 0;
        const marginRight = properties.margin_right || 0;
        const marginBottom = properties.margin_bottom || 0;
        const marginLeft = properties.margin_left || 0;
        const noMarginsFirstPage = properties.no_margins_first_page;
        const hideHeaderFooterFirstPage = properties.hide_header_footer_first_page;

        addLog(`Building URLs...`);
        const cleanHomeUrl = homeUrl.endsWith('/') ? homeUrl.slice(0, -1) : homeUrl;
        const bubbleUploadUrl = `${cleanHomeUrl}/fileupload`;
        let cleanPageName = pageName.startsWith('/') ? pageName.slice(1) : pageName;
        let targetUrl = `${cleanHomeUrl}/${cleanPageName}`;

        try {
            const urlObj = new URL(targetUrl);
            if (p1) urlObj.searchParams.append("p1", p1);
            if (p2) urlObj.searchParams.append("p2", p2);
            if (p3) urlObj.searchParams.append("p3", p3);
            targetUrl = urlObj.toString();
        } catch (e) {
            const errMsg = `Error building URL: ${e.message}`;
            addLog(errMsg);
            instance.publishState('error_message', errMsg);
            instance.publishState('is_generating', false);
            instance.triggerEvent('error');
            context.reportDebugger(errMsg);
            return;
        }

        // Costruzione Payload
        const payload = {
            targetUrl: targetUrl,
            bubble_upload_url: bubbleUploadUrl,
            file_name: fileName,
            api_key: GLOBAL_API_KEY, // Usiamo la chiave dal context
            magic_link: magicLink,
            options: { 
                format: format, 
                width: customW, 
                height: customH,
                quality: quality,
                timezone: timezone,
                bubble_offset: bubbleOffset, 
                orientation: orientation,
                margins: {
                    top: marginTop,
                    right: marginRight,
                    bottom: marginBottom,
                    left: marginLeft,
                    no_margins_first_page: noMarginsFirstPage,
                    hide_header_footer_first_page: hideHeaderFooterFirstPage
                }
            },
            meta: { attach_to: attachTo }
        };
        
        addLog("Sending request to Cloud...");
        if (magicLink) addLog("Using Magic Link auth.");

        fetch(LAMBDA_URL, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        })
        .then(async (response) => {
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
        .then((result) => {
            if (result.status === "success") {
                const fileUrl = result.file_url;
                addLog(`Success! PDF Generated.`);
                if (result.debug_logs && Array.isArray(result.debug_logs)) console.log("--- LAMBDA LOGS ---\n", result.debug_logs.join('\n'));
                
                instance.publishState('file_url', fileUrl);
                instance.publishState('is_generating', false); 
                instance.triggerEvent('generated');

                if (shouldDownload === true) {
                    addLog("Downloading...");
                    fetch(fileUrl).then(r => r.blob()).then(blob => {
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a'); link.href = blobUrl; link.download = fileName;
                        document.body.appendChild(link); link.click();
                        setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(blobUrl); }, 100);
                    }).catch(err => { window.open(fileUrl, '_blank'); });
                }
            } else {
                const msg = result.message || "Unknown error";
                if (result.debug_logs) console.error("Lambda Debug Logs:", result.debug_logs);
                throw new Error(msg);
            }
        })
        .catch((error) => {
            addLog(`FATAL ERROR: ${error.message}`);
            instance.publishState('error_message', error.message);
            instance.publishState('is_generating', false); 
            instance.triggerEvent('error');
            context.reportDebugger(error.message);
        });
    };
}