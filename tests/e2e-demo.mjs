// Pruebas E2E de la UI. El backend se simula para no alterar los pedidos de Supabase.
// Las transacciones reales se verifican aparte con supabase/tests/order-smoke.sql.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const URL = "http://127.0.0.1:3100";
const sample = {
  id: "1", slug: "white-sneakers", name: "White Sneakers", category: "sneakers",
  price: 649000, featured: true, description: "Zapatillas blancas de demostración.",
  tone: "light", image: "/products/white-sneakers/SNKRWITH1-wide.webp",
  gallery: ["/products/white-sneakers/SNKRWITH1-wide.webp"],
  variants: [{
    color: "Blanco", colorValue: "#f5f5f2", sizes: ["38","39"],
    image: "/products/white-sneakers/SNKRWITH1-wide.webp",
    gallery: ["/products/white-sneakers/SNKRWITH1-wide.webp"],
    stock: {"38":1,"39":2}
  }]
};
const server = spawn("npm", ["run","start"], {
  env: {...process.env, PORT:"3100", SUPABASE_URL:"", SUPABASE_SECRET_KEY:"", SUPABASE_SERVICE_ROLE_KEY:""},
  stdio:"pipe",
  detached:true,
});
server.stdout.on("data", chunk => process.stdout.write(chunk));
server.stderr.on("data", chunk => process.stderr.write(chunk));

async function waitForServer() {
  for (let i=0; i<90; i++) {
    try {
      const res=await fetch(URL);
      if(res.ok) return;
    } catch {}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw new Error("Next.js no respondió en 90 segundos");
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch({headless:true});
  await mkdir("test-artifacts", {recursive:true});
  try {
    for(const [label,viewport] of Object.entries({
      desktop:{width:1440,height:900},
      mobile:{width:390,height:844},
    })) {
      const page=await browser.newPage({viewport,deviceScaleFactor:1});
      page.setDefaultTimeout(12000);
      console.log(`INICIO E2E ${label}`);
      let orderCount=0;
      await page.route("**/api/catalog",route=>route.fulfill({
        status:200,contentType:"application/json",
        headers:{"cache-control":"no-store"},
        body:JSON.stringify({configured:true,products:[sample]}),
      }));
      await page.route("**/api/orders",async route=>{
        orderCount++;
        const request=route.request().postDataJSON();
        assert.equal(request.items[0].productId,"1");
        assert.equal(request.items[0].size,"38");
        assert.equal(request.items[0].color,"Blanco");
        assert.equal(request.items[0].quantity,1);
        assert.equal(request.expectedSubtotal,649000);
        assert.equal(request.expectedDeliveryCost,0);
        assert.equal(request.deliveryMethod,"pickup");
        assert.equal(request.paymentMethod,"cash");
        assert.match(request.requestId,/^[a-f0-9-]{36}$/i);
        return route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({
          order:{
            id:"6b05a4e6-11e6-4a0f-8e27-8389a3d62f24",
            code:"OFF-DEMO-0001",createdAt:new Date().toISOString(),
            customer:request.customer,items:request.items.map(item=>({...item,name:"White Sneakers",price:649000})),
            subtotal:649000,deliveryCost:0,total:649000,deliveryMethod:"pickup",
            paymentMethod:"cash",paymentStatus:"pending",status:"pending"
          }
        })});
      });

      await page.goto(URL,{waitUntil:"domcontentloaded"});
      console.log(`Catálogo cargando (${label})`);
      await page.getByRole("note").getByText("OFFGRID · DEMO").waitFor();
      await page.getByRole("button",{name:/Ver detalles de White Sneakers/i}).first().click();
      const dialog=page.getByRole("dialog").first();
      await dialog.getByRole("button",{name:"Blanco",exact:true}).click();
      await dialog.getByRole("button",{name:/38, pocas unidades/i}).click();
      await dialog.getByRole("button",{name:/AGREGAR AL CARRITO/}).click();

      // Al agregar el producto, la propia tienda abre el carrito automáticamente.
      await page.getByRole("dialog",{name:"Tu carrito"}).waitFor();
      await page.getByRole("button",{name:"FINALIZAR COMPRA"}).click();
      await page.waitForURL("**/checkout");
      await page.getByRole("button",{name:"Usar datos de ejemplo"}).click();
      await page.getByRole("button",{name:"CONTINUAR"}).click();
      await page.getByRole("button",{name:/Retiro en local/i}).click();
      await page.getByRole("button",{name:"CONTINUAR"}).click();
      await page.getByRole("button",{name:/Efectivo/i}).click();
      await page.getByRole("button",{name:"CONTINUAR"}).click();
      await page.getByRole("button",{name:/CONFIRMAR PEDIDO/i}).click();
      await page.getByText("¡Simulación completada!").waitFor();
      await page.getByText("OFF-DEMO-0001").waitFor();
      assert.equal(orderCount,1,`Pedido duplicado en ${label}`);
      await page.screenshot({path:`test-artifacts/${label}-checkout.png`,fullPage:true});

      if(label==="mobile") {
        await page.goto(URL,{waitUntil:"domcontentloaded"});
        await page.getByRole("button",{name:"Abrir menú"}).click();
        await page.getByRole("navigation",{name:"Navegación móvil"}).getByText("Catálogo").waitFor();
        await page.screenshot({path:"test-artifacts/mobile-menu.png",fullPage:true});
        const width=await page.evaluate(()=>({
          scroll:document.documentElement.scrollWidth,
          viewport:document.documentElement.clientWidth
        }));
        assert(width.scroll<=width.viewport+2,`Desbordamiento móvil: ${JSON.stringify(width)}`);
      }
      await page.close();
      process.stdout.write(`E2E ${label}: compra demo, carrito, checkout y confirmación OK\\n`);
    }

    // Administración: sesión, inventario actualizado y reset de datos ficticios.
    const admin = await browser.newPage({viewport:{width:1365,height:900}});
    admin.setDefaultTimeout(12000);
    let savedStock = 1;
    let saveCount = 0;
    let resetCount = 0;

    await admin.route("**/api/admin/session",route=>route.fulfill({
      status:200,contentType:"application/json",
      body:JSON.stringify({authenticated:true,configured:true})
    }));
    await admin.route("**/api/admin/data",route=>{
      if(route.request().method()==="PATCH"){
        const data=route.request().postDataJSON();
        assert.equal(data.kind,"stock");
        assert.equal(data.id,"1");
        assert.equal(data.size,"38");
        assert.equal(data.color,"Blanco");
        savedStock=data.value;
        saveCount++;
        return route.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
      }
      return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
        orders:[],
        catalog:[{id:"1",data:{name:"White Sneakers"},price:649000,active:true}],
        inventory:[{product_id:"1",color:"Blanco",size:"38",quantity:savedStock}]
      })});
    });
    await admin.route("**/api/admin/reset",route=>{
      assert.equal(route.request().postDataJSON().confirmation,"RESTABLECER DEMO");
      resetCount++;
      savedStock=0;
      return route.fulfill({status:200,contentType:"application/json",body:'{"ok":true,"orders_deleted":0,"variants_reset":1}'});
    });

    await admin.goto(URL+"/admin",{waitUntil:"domcontentloaded"});
    await admin.getByRole("heading",{name:"Panel administrativo"}).waitFor();
    await admin.getByRole("button",{name:"Productos y stock"}).click();
    const stockForm=admin.locator("form").filter({hasText:"Blanco · 38"});
    await stockForm.getByRole("spinbutton",{name:"Cantidad en stock"}).fill("3");
    await stockForm.getByRole("button",{name:"Guardar"}).click();
    await admin.getByText(/Cambio guardado/).waitFor();
    assert.equal(saveCount,1);
    assert.equal(savedStock,3);

    admin.once("dialog",dialog=>dialog.accept("RESTABLECER DEMO"));
    await admin.getByRole("button",{name:"Restablecer demo"}).click();
    await admin.getByText(/Demo restaurada/).waitFor();
    assert.equal(resetCount,1);
    await admin.screenshot({path:"test-artifacts/admin-demo.png",fullPage:true});
    await admin.close();
    console.log("E2E administración: stock y restablecimiento demo OK");

  } finally {await browser.close();}
}

try {
  await run();
} catch(error) {
  console.error(error);
  process.exitCode=1;
} finally {
  try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill("SIGTERM"); }
  server.stdout.destroy();
  server.stderr.destroy();
  process.exit(process.exitCode ?? 0);
}
