async function(properties, context) {
    
    // --- 1. CONFIGURAZIONE ---
    const GLOBAL_API_KEY = context.keys["MAGIC PDF API KEY"];
    const BACKEND_API_KEY = context.keys["MAGIC PDF BACKEND API KEY"];
    const webhookUrl = properties.webhook_url;
    const documentId = properties.id; 

    // Decodifica URL Lambda
    const _p1 = "aHR0cHM6Ly9ybHpkdHB2cTNqbzZ6Zmd1emJmNXRtY3NybTB4cnNweC5";
    const _p2 = "sYW1iZGEtdXJsLmV1LW5vcnRoLTEub24uYXdzLw==";
    const LAMBDA_URL = Buffer.from(_p1 + _p2, 'base64').toString('ascii');

    // --- 2. VALIDAZIONI ---
    if (!GLOBAL_API_KEY) throw new Error("Configuration Error: 'MAGIC PDF API KEY' missing in Plugin Settings.");
    
    const homeUrl = properties.website_home_url;
    const pageName = properties.page_name;

    if (!homeUrl || !pageName) throw new Error("Error: Missing Website Home URL or Page Name.");

    // --- 3. PARAMETRI ---
    const fileName = properties.file_name || "document.pdf";
    const format = properties.format;
    const customW = properties.custom_width;
    const customH = properties.custom_height;
    const orientation = properties.orientation || "Portrait";
    const quality = properties.quality || 1;
    const magicLink = properties.magic_link;
    const attachTo = properties.attach_to;
    const timezone = properties.timezone;
    const bubbleOffset = properties.bubble_offset_string;
    const p1 = properties.p1;
    const p2 = properties.p2;
    const p3 = properties.p3;
    const marginTop = properties.margin_top || 0;
    const marginRight = properties.margin_right || 0;
    const marginBottom = properties.margin_bottom || 0;
    const marginLeft = properties.margin_left || 0;
    const noMarginsFirstPage = properties.no_margins_first_page;
    const hideHeaderFooterFirstPage = properties.hide_header_footer_first_page;

    // --- 4. COSTRUZIONE URL TARGET ---
    const cleanHomeUrl = homeUrl.endsWith('/') ? homeUrl.slice(0, -1) : homeUrl;
    const bubbleUploadUrl = `${cleanHomeUrl}/fileupload`;
    const cleanPageName = pageName.startsWith('/') ? pageName.slice(1) : pageName;
    
    let targetUrl = `${cleanHomeUrl}/${cleanPageName}`;
    let queryParams = [];
    if (p1) queryParams.push(`p1=${encodeURIComponent(p1)}`);
    if (p2) queryParams.push(`p2=${encodeURIComponent(p2)}`);
    if (p3) queryParams.push(`p3=${encodeURIComponent(p3)}`);
    if (queryParams.length > 0) targetUrl += "?" + queryParams.join("&");

    // --- 5. PAYLOAD PER LAMBDA ---
    const payload = {
        targetUrl: targetUrl,
        bubble_upload_url: bubbleUploadUrl,
        file_name: fileName,
        api_key: GLOBAL_API_KEY,
        backend_api_key: BACKEND_API_KEY,
        magic_link: magicLink,
        webhook_url: webhookUrl,
        custom_id: documentId,
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
        meta: { attach_to: attachTo, custom_id: documentId }
    };

    // --- 6. CHIAMATA LAMBDA E WEBHOOK ---
    try {
        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Lambda Error: ${errText}`);
        }

        const result = await response.json();
        const isSuccess = result.status === "success";
        const fileUrl = isSuccess ? result.file_url : null;

        if (isSuccess) {
            return {
                file_url: fileUrl,
                success: true
            };
        } else {
            throw new Error(result.message || "Unknown error from PDF Engine");
        }

    } catch (error) {
        console.error("PDF SERVER ACTION ERROR:", error.message);
        throw error;
    }
}