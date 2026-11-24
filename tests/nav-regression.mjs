import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
import {chromium,webkit} from "playwright";

const URL="http://127.0.0.1:3100";
const ids=["categorias","destacados","catalogo","coleccion","nosotros"];
const names=["Categorías","Destacados","Catálogo","Colección","Nosotros"];
const product={
  id:"1",slug:"white-sneakers",name:"White Sneakers",category:"sneakers",
  price:649000,featured:true,description:"Zapatillas de prueba",
  tone:"light",image:"/products/white-sneakers/SNKRWITH1-wide.webp",
  variants:[{color:"Blanco",sizes:["38"],stock:{"38":3},image:"/products/white-sneakers/SNKRWITH1-wide.webp"}]
};
const child=spawn("npm",["run","start"],{env:{...process.env,PORT:"3100",SUPABASE_URL:"",SUPABASE_SECRET_KEY:"",SUPABASE_SERVICE_ROLE_KEY:""},stdio:"pipe",detached:true});
child.stdout.on("data",s=>process.stdout.write(s));
child.stderr.on("data",s=>process.stderr.write(s));
async function waitServer(){
  for(let i=0;i<60;i++){
    try{if((await fetch(URL)).ok)return;}catch{}
    await new Promise(r=>setTimeout(r,1000));
  }
  throw Error("Servidor no inició");
}
async function collectState(page,id){
  return page.evaluate((id)=>{
    const el=document.getElementById(id);
    const header=document.querySelector("header");
    const rect=el?.getBoundingClientRect();
    const hr=header?.getBoundingClientRect();
    const vh=document.documentElement.clientHeight;
    const point=hr?document.elementFromPoint(Math.round(hr.left+hr.width/2),Math.round(hr.top+hr.height/2)):null;
    return {hash:location.hash,scroll:Math.round(scrollY),found:!!el,
      targetTop:rect?Math.round(rect.top):null,headerBottom:hr?Math.round(hr.bottom):null,
      viewport:vh,headerTag:point?.tagName,bodyOverflow:document.body.style.overflow,
      scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth};
  },id);
}
async function verify(page,id,mode,from){
  await page.waitForTimeout(1150);
  const s=await collectState(page,id);
  const success=s.found&&s.hash==="#"+id&&s.targetTop>=s.headerBottom-32&&s.targetTop<Math.min(s.viewport,350);
  console.log("NAV_CHECK",JSON.stringify({mode,from,id,success,...s}));
  if(!success) {
    await page.screenshot({path:`test-artifacts/nav-failure-${mode}-${id}.png`,fullPage:false});
    throw Error(`NAV_FAIL ${mode}/${id} ${from}: ${JSON.stringify(s)}`);
  }
}
async function run(){
  await waitServer();
  await mkdir("test-artifacts",{recursive:true});
  const browser=await chromium.launch({headless:true});
  const safari=process.env.OFFGRID_TEST_WEBKIT==="1" ? await webkit.launch({headless:true}) : null;
  try{
    for(const [mode,viewport] of Object.entries({
      desktop:{width:1440,height:900},tablet:{width:820,height:1100},
      iphone:{width:390,height:844},"iphone-webkit":{width:390,height:844}
    }).filter(([mode])=>mode!=="iphone-webkit"||safari)){
      const isPhone=mode.startsWith("iphone");
      const activeBrowser=mode==="iphone-webkit"?safari:browser;
      const page=await activeBrowser.newPage({viewport,isMobile:isPhone,hasTouch:isPhone});
      page.setDefaultTimeout(14000);
      const errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      page.on("console",message=>{if(message.type()==="error") errors.push(message.text())});
      await page.route("**/api/catalog",async route=>{
        // Destacados debe existir incluso antes de que llegue el catálogo.
        if(mode==="desktop") await new Promise(resolve=>setTimeout(resolve,1200));
        return route.fulfill({
          status:200,contentType:"application/json",headers:{"cache-control":"no-store"},
          body:JSON.stringify({configured:true,products:[product]})
        });
      });
      await page.goto(URL,{waitUntil:"domcontentloaded"});
      const anchorBeforeCatalog=await page.evaluate(()=>!!document.getElementById("destacados"));
      assert(anchorBeforeCatalog,`Falta #destacados antes de cargar el catálogo (${mode})`);
      await page.waitForFunction(()=>!!document.querySelector('#destacados article'));
      await page.screenshot({path:`test-artifacts/nav-${mode}-initial.png`,fullPage:false});
      if(mode==="desktop"){
        for(const from of ["bottom","middle","top","same-hash"]){
          for(let i=0;i<ids.length;i++){
            const id=ids[i],name=names[i];
            const scrollTarget=from==="bottom"?999999:from==="middle"?Math.round(await page.evaluate(()=>document.body.scrollHeight/2)):from==="top"?0:Math.round(await page.evaluate(()=>document.body.scrollHeight*.63));
            await page.evaluate(y=>window.scrollTo({top:y,behavior:"instant"}),scrollTarget);
            await page.waitForTimeout(40);
            const link=page.getByRole("navigation",{name:"Principal"}).getByRole("link",{name,exact:true});
            await link.click();
            await verify(page,id,mode,from);
            if(from==="same-hash"){
              await page.evaluate(()=>window.scrollTo({top:999999,behavior:"instant"}));
              await page.waitForTimeout(70);
              await link.click();
              await verify(page,id,mode,"repeated-same-fragment");
              if(id==="categorias") await page.screenshot({path:`test-artifacts/nav-${mode}-repeat-categorias.png`,fullPage:false});
            }
          }
        }
      }else{
        for(const from of ["top","bottom","same-hash"]){
          for(let i=0;i<ids.length;i++){
            const id=ids[i],name=names[i];
            await page.evaluate(y=>window.scrollTo({top:y,behavior:"instant"}),from==="top"?0:999999);
            await page.getByRole("button",{name:"Abrir menú"}).click();
            const nav=page.getByRole("navigation",{name:"Navegación móvil"});
            await nav.getByRole("link",{name,exact:true}).waitFor();
            await nav.getByRole("link",{name,exact:true}).click();
            await nav.waitFor({state:"hidden"});
            await verify(page,id,mode,from);
            if(from==="same-hash"){
              await page.evaluate(()=>window.scrollTo({top:999999,behavior:"instant"}));
              await page.getByRole("button",{name:"Abrir menú"}).click();
              await nav.getByRole("link",{name,exact:true}).click();
              await nav.waitFor({state:"hidden"});
              await verify(page,id,mode,"repeated-same-fragment");
            }
          }
        }
        await page.getByRole("button",{name:"Abrir menú"}).click();
        await page.screenshot({path:`test-artifacts/nav-${mode}-open.png`,fullPage:false});
        await page.keyboard.press("Escape");
        await page.getByRole("navigation",{name:"Navegación móvil"}).waitFor({state:"hidden"});
      }
      assert.equal(errors.length,0,`Errores JS ${mode}: ${errors.join(" | ")}`);
      const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      assert(width.scroll<=width.client+2,`Desbordamiento ${mode}: ${JSON.stringify(width)}`);
      // El header no debe cubrir ni inutilizar el botón de producto ni el carrito.
      await page.getByRole("button",{name:/Ver detalles de White Sneakers/i}).first().click();
      await page.getByRole("dialog",{name:"Detalles de White Sneakers"}).waitFor();
      await page.getByRole("button",{name:"Cerrar producto"}).click();
      await page.getByRole("button",{name:/Abrir carrito/i}).click();
      await page.getByRole("dialog",{name:"Tu carrito"}).waitFor();
      await page.getByRole("dialog",{name:"Tu carrito"}).getByRole("button",{name:"Cerrar carrito"}).click();

      await page.screenshot({path:`test-artifacts/nav-${mode}-final.png`,fullPage:false});
      await page.close();
      console.log(`NAV_PASS ${mode}`);
    }
  }finally{await browser.close();await safari?.close()}
}
try{await run()}catch(e){console.error(e);process.exitCode=1}finally{
 try{process.kill(-child.pid,"SIGTERM")}catch{child.kill("SIGTERM")}
 child.stdout.destroy();child.stderr.destroy();process.exit(process.exitCode??0);
}
