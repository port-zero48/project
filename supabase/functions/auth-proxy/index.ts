const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, apikey, x-supabase-api-version"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Remove the function name from the path
    pathParts.shift();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const targetPath = "/" + pathParts.join("/");
    const targetUrl = new URL(targetPath, supabaseUrl);
    
    // Copy query parameters
    targetUrl.search = url.search;
    
    // Create headers for the proxy request
    const proxyHeaders = new Headers(req.headers);
    proxyHeaders.set("apikey", supabaseAnonKey);
    proxyHeaders.delete("host");
    
    const proxyResponse = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: proxyHeaders,
      body: req.body
    });
    
    const responseBody = await proxyResponse.text();
    
    return new Response(responseBody, {
      status: proxyResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": proxyResponse.headers.get("Content-Type") || "application/json"
      }
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
