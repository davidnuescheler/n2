/* ------
general purpose helix pages / display scripts
--------- */

(() => {
    const scrani = (() => {
    
        const scrani = { 
            
            // config
            animations: [            
                {selector: "body>main>div", animation:"eager-appear"},
            ],

            scrollY: -1,
            scrollYBottom:  0,
        }

        // setup
        scrani.setup = () => {
            for (let i=0; i<scrani.animations.length; i++) {
                a = scrani.animations[i];
                a.elems=document.querySelectorAll(a.selector);
            }
        }

        // update single element
        scrani.updateElement = (el, animation) => {
            let progress=0.0;
            const offsetTop = el.getBoundingClientRect().top+window.pageYOffset;

            if (scrani.scrollY > offsetTop) {
                progress=1.0;
            } else if (scrani.scrollYBottom < offsetTop) {
                progress=0.0;
            } else {
                progress=1.0-(offsetTop - scrani.scrollY)/window.innerHeight;
            }

            // HACK: manually specified animation
            progress=progress*2;
            if (progress>1) progress=1;
            
            if (animation == "eager-appear") {
                const transY=100-progress*100;
                const opacity=progress;
                el.style=`opacity: ${opacity}; transform: translateY(${transY}px)`;    
            }

            if (animation == "wipe") {
                const right=Math.round(100-progress*100);
                el.style=`clip-path: inset(0 ${right}% 0 0); -webkit-clip-path: inset(0 ${right}% 0 0)`;
            }
        }

        // update to get called by requestAnimationFrame
        scrani.update = (scrollY) => {
            
            if (scrollY == scrani.scrollY) return;

            scrani.scrollY = scrollY;
            scrani.scrollYBottom = scrollY+window.innerHeight;

            for (let i=0; i<scrani.animations.length;i++) {
                const a = scrani.animations[i];
                for (let j=0; j<a.elems.length;j++) {
                    scrani.updateElement(a.elems[j], a.animation);
                }
            }
        }

        //to be called onload
        scrani.onload = () => {
            
            scrani.setup();
            const repaint = () => {
                scrani.update(window.scrollY)
                window.requestAnimationFrame(repaint)
            }
            window.requestAnimationFrame(repaint);
  
        }

        return (scrani)
    })();

    window.scrani = scrani; 

})();

function classify() {
  // add inner text of h1 as a class on each h1
  document.querySelectorAll("main h1").forEach((e) => {
    var label = stripName(e.textContent);
    e.parentElement.classList.add(label);
  });
  // position sidebar images (odd on left, even on right)
  document.querySelectorAll("div.image").forEach((e, i) => {
    e.classList.add(i % 2 ? "right" : "left");
  });
  document.querySelector("main").classList.add("appear");
}
function wrapMenus() {
    hWrap(document.querySelector("main div.menu"),5);
    var h1=document.querySelector("main div.menu h1");
    document.querySelector("main div.menu").insertBefore(h1.cloneNode(true), document.querySelector("main div.menu>div"));
    h1.parentNode.removeChild(h1);
}

function hWrap(el, maxlevel) {
    var level=0;
    var newlevel=0;
    var wrapped=document.createElement('div');
    var currentParent=wrapped;
    Array.from(el.children).forEach((e) => {
        if (e.tagName.substr(0,1) == "H") {
            newlevel=+e.tagName.substr(1,1);
            
            if (newlevel<maxlevel) {
                if (newlevel<=level) {
                    while (newlevel<=level) {
                        currentParent=currentParent.parentElement;
                        level--;
                    }
                }
                if (newlevel>level) {
                    while (newlevel>level) {
                        var div=document.createElement('div');
                        if ((newlevel==level+1) && newlevel>1) div.className = e.id;
                        currentParent.appendChild(div);
                        currentParent=div;    
                        level++;
                    }
                } 
            }
    
        }
        currentParent.appendChild(e.cloneNode(true));
    })
    el.innerHTML="";
    el.appendChild(wrapped.firstChild);
};

async function fetchJSON(url) {
    let response=await fetch(url);
    let json={};
    if (response.ok) { 
      json = await response.json();
    }
    return (json)
}

function fixIcons() {
    document.querySelectorAll("use").forEach (async (e) => {
        var a=e.getAttribute("href");
        var name=a.split("/")[2].split(".")[0];
        if (name == 'participant' || name == 'donations') {
            var json=await fetchJSON('/blm-fundraiser-data-new.json');
            html='';
            json.forEach((r) => {
                var text=r[name];
                var link=r[name+'-link']
                var desc=r[name+'-description']
                if (text) {
                    if (link) {
                        html+=`<p><a href="${link}"><b>${text}</b></a>`;
                        if (desc) html+=`<br>${desc}`;
                        html+=`</p>`;
                    } else {
                        html+=`<p><b>${text}</b>`;
                        if (desc) html+=`<br>${desc}`;
                        html+=`</p>`;
                    }
                }
            })
            var div=document.createElement('div');
            div.innerHTML=html;

            e.parentNode.parentNode.replaceChild(div,e.parentNode);
        }
        if (name == 'lab-cone') {
            var $div=document.createElement('div');
            $div.id='labconepreview';
            e.parentNode.parentNode.replaceChild($div, e.parentNode);
            setTimeout(randomizeLabCone, 1000);
        } else {
            e.setAttribute("href", `/icons.svg#${name}`);
            if (e.parentNode.parentNode.tagName=='A') {
                e.parentNode.parentNode.classList.add('noborder');
            }
        }
    });
}

function decorateIcons() { 
    document.querySelectorAll('main a svg').forEach(($svg) => {
        $svg.closest('a').classList.add('noborder');
    });
    $labcone=document.querySelector('.icon-lab-cone');
    // if `.icon-lab-cone` exists in google doc (svg of :#lab-cone:)
    if ($labcone) {
        var $div=document.createElement('div');
        $div.id='labconepreview';
        // replace :#lab-cone: svg with new `div#labconepreview`
        $labcone.parentNode.replaceChild($div, $labcone);
        setTimeout(randomizeLabCone, 1000);
    }
}

function cloneMenuSwiper() {
    var menu=document.querySelector("div.menu");
    var mobilemenu=menu.cloneNode(true);
    mobilemenu.querySelector(":scope>div").className="locations-menus";
    var titleswitcher=document.createElement('div');
    titleswitcher.className="locations";
    mobilemenu.querySelectorAll("h2").forEach((e) => {
        titleswitcher.appendChild(e.cloneNode(true));
        e.parentNode.removeChild(e);
    });
    mobilemenu.insertBefore(titleswitcher, mobilemenu.firstChild);
    menu.classList.add("desktop");
    menu.parentNode.insertBefore(mobilemenu,menu.nextSibling);
}

var menuLocation="store";
var menuOffset=0;

function setMenuLocation(e) {
    
}

function bindInputs(inputs) {
    inputs.forEach((e) => {
        e.value=localStorage.getItem(e.id);
        e.addEventListener('change', (event) => {
            localStorage.setItem(event.target.id, event.target.value);
        })
    })
}

function updateMenuDisplay() {
    var vw=window.innerWidth;
    var p=(vw-375)/375;
    // console.log(`p: ${p}`);
    p=Math.max(p,0);
    p=Math.min(p,1);
    // console.log(`p: ${p}`);
    var pink=[252,216,199];
    var blue=[0,1,253];
    var r=pink[0]*(1-p)+blue[0]*(p);
    var g=pink[1]*(1-p)+blue[1]*(p);
    var b=pink[2]*(1-p)+blue[2]*(p);
    document.querySelector(".locations-menus .lab").style=`color:rgba(${r},${g},${b},1)`;
    document.querySelector(".locations #lab").style=`color:rgba(${r},${g},${b},1)`;
}

function isAndroid() {
    var os="";
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        os="android";
    }

    // console.log(os);
    return (os=="android");

}

function resizeImages() {
    document.querySelectorAll('main div img').forEach((i) => {
        var s = i.getAttribute('src');
        if (s.indexOf('/hlx_')==0) {
            i.setAttribute('src',s+'?width=256')
        }
    })
}


function fixSmsUrls() {    
    document.querySelectorAll("main a").forEach((e) => {
        var href=e.getAttribute("href");
        if (href && href.indexOf("https://sms.com")==0) {
            var smshref="sms:/"+href.substr(15);
            if (isAndroid()) {
                var s=smshref.split("&body");
                smshref=s[0]+"?body"+s[1];
            }
            e.setAttribute("href",smshref);
        }
    })

}

function setEmbedVideo() {
    const $embed = document.querySelector(".embed");
    if ($embed) {
        const $video = document.createElement("video");
            $video.controls = true;
            $video.textContent = "your browser does not support video!";
        const $source = document.createElement("source");
            $source.setAttribute("src", "https://frameio-assets-production.s3-accelerate.amazonaws.com/encode/6c358e9f-d7fe-49fb-bab2-de2fcc58681e/h264_1080_best.mp4?x-amz-meta-project_id=c443ce40-7e51-42a6-9247-ad27d3e41cc8&x-amz-meta-request_id=Fk6cFB9oX_n9RuEDM3SH&x-amz-meta-resource_id=6c358e9f-d7fe-49fb-bab2-de2fcc58681e&x-amz-meta-resource_type=asset&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZ5BPIQ3GK7SUUGPX%2F20201208%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20201208T021527Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=33df5c412750a387a634765f7f1a6ff9d41c33a9cda48f3e67043c47a424a712");
            $source.setAttribute("type", "video/mp4");
        $video.append($source);
        $embed.prepend($video);
    }
}

function setColors() {
    let root = document.documentElement;
    // select all code elements on page 
      // (these are in red blocks in the google doc)
    document.querySelectorAll('code').forEach(($code) => {
        $code.innerText.split('\n').forEach((line)=>{
            var splits=line.split(':');
            if (splits[1]) {
                if (splits[0].startsWith('--')) {
                    // set property on document's CSSStyleDeclaration
                    root.style.setProperty(splits[0].trim(), splits[1].trim());
                } else if (splits[0].trim() == 'class') {
                    // add class to code element's parent's parent
                    $code.parentNode.parentNode.classList.add(splits[1].trim());
                }
            }
        })    
    })
}

function highlightNav() {
    var currentPath=window.location.pathname.split('.')[0];
    document.querySelectorAll('header>ul>li>a').forEach((e) => {
        var href=e.getAttribute('href').split('.')[0];
        if (currentPath==href) e.parentNode.classList.add('selected');
    })
}

// set store location based on URL
function setLocation() {
    // console.log(`setLocation -> window.location.pathname`, window.location.pathname);
    switch (window.location.pathname) {
        case "/delivery":
        case "/delivery2": // testing delivery
        case "/delivery.html": 
        case "/delivery2.html": // testing delivery
            storeLocation = 'delivery';
            break;
        case "/lab":
        case "/lab2": // testing lab
        case "/lab.html":
        case "/lab2.html": // testing lab
            storeLocation = 'lab';
            break;
        default:
            storeLocation = 'store'
            break;
    }
    // console.log(`  setLocation -> storeLocation`, storeLocation);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function generateId() {
    var id="";
    var chars="123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i=0;i<4;i++) {
        id+=chars.substr(Math.floor(Math.random()*chars.length),1);
    }
    return id;
}


/* ------
pim and catalog management handling
--------- */


function indexCatalog() {
  catalog = {
    byId: {},
    items: [],
    categories: [],
    discounts: {},
  };
  catalog_raw.forEach((e) => {
    if (!catalog.byId[e.id]) catalog.byId[e.id] = e;

    if (e.type == "ITEM") {
      catalog.items.push(e);
      if (e.item_data.variations)
        e.item_data.variations.forEach((v) => {
          catalog.byId[v.id] = v;
        });
    }
    if (e.type == "MODIFIER_LIST") {
      if (e.modifier_list_data.modifiers)
        e.modifier_list_data.modifiers.forEach((m) => {
          m.modifier_data.modifier_list_id = e.id;
          // console.log(m.modifier_data.modifier_list_id);
          catalog.byId[m.id] = m;
        });
    }
    if (e.type == "DISCOUNT") {
      if (e.discount_data.name) {
        catalog.discounts[e.discount_data.name.toLowerCase()] = { id: e.id };
      }
    }
    if (e.type == "CATEGORY") {
      catalog.categories.push(e);
    }
  });
} 

/* ------
product config
--------- */


function hideConfig() {
    var config=document.getElementById("config");
    config.classList.add("hidden");
    document.body.classList.remove("noscroll");
}

function isFixedPickup(item) {
    if (item.item_data.variations[0].item_variation_data.name.indexOf('day ')>0) {
        return true;
    }
    return false;
}

function getScrollingOffset($sel) {
    var selpos = $sel.offsetLeft-$sel.parentNode.firstChild.offsetLeft;
    var selwidth = $sel.offsetWidth;
    var wrapperwidth=document.querySelector("#config.cone-builder .wrapper").offsetWidth;
    var newOffset=-Math.round(selpos+(selwidth-wrapperwidth)/2);
    return newOffset;
}

function adjustScrolling($sel) {
    var newOffset=getScrollingOffset($sel);
    $sel.parentNode.style=`transform: translateX(${newOffset}px)`;
    scrollOffsets[$sel.parentNode.parentNode.getAttribute('data-name')]=newOffset;
}
function hasDip() {
    const dips=document.querySelector('div[data-name="dip"]');
    if (dips) {
        const seldip=dips.querySelector('.selected');
        const nodip=dips.querySelector('.cb-options span:first-of-type');
        const dip=(seldip==nodip)?0:1;
        return dip;    
    }
    return (0);
}

function updateNumberOfToppings() {
    var dip=hasDip();
    title=`pick up to ${dip?2:3} toppings`;
    const toppingTitle=document.querySelector('div[data-name="topping"] h4');
    toppingTitle.innerHTML=title;
}

function coneBuilderSelect($sel) {
    if (($sel.parentNode.parentNode.getAttribute('data-name')=='topping') && ($sel != $sel.parentNode.firstChild)) {
        $sel.parentNode.firstChild.classList.remove('selected');
        if (!$sel.classList.contains('selected')) {
            //check for too many toppings
            const numToppings=$sel.parentNode.querySelectorAll('.selected').length;
            const dip=hasDip();
            if (dip+numToppings>=3) {
                alert ('sorry, 2 toppings+dip or 3 toppings without a dip');
            } else {
                $sel.classList.add('selected');
            }
        } else {
            $sel.classList.remove('selected');
            if (!$sel.parentNode.querySelector('.selected'))
                $sel.parentNode.firstChild.classList.add('selected');
        }
    } else {
        $sel.parentNode.querySelectorAll("span").forEach(($e) => {
            $e.classList.remove('selected');
        })    
        $sel.classList.add('selected');
    }

    updateNumberOfToppings();

    showConfig();
    adjustScrolling($sel);
}


function randomizeLabCone() {
    var $labcone=document.getElementById('labconepreview');
    if ($labcone) {
        // target "build your soft serve" button
        var $a=document.querySelector('a.labcone');
        var itemid=$a.getAttribute('data-id');
        var mods=createRandomConfig(itemid);
        $labcone.innerHTML=createConeFromConfig(mods);
    }
    setTimeout(randomizeLabCone,300);
}

function createRandomConfig(itemid) {
    // get item out of catalog using id from "build your soft serve" button
    var item=catalog.byId[itemid];
    // console.log(`createRandomConfig -> item`, item);
    var config=[];
    // console.log(`  createRandomConfig -> item.item_data.modifier_list_info`, item.item_data.modifier_list_info);
    // loop through modifer_list_info on id from "build your soft serve" button
    item.item_data.modifier_list_info.forEach((ml) => {
        var mods=catalog.byId[ml.modifier_list_id].modifier_list_data.modifiers;
        // console.log(`    createRandomConfig -> mods`, mods);
        var mlname=catalog.byId[ml.modifier_list_id].modifier_list_data.name;
        // console.log(`    createRandomConfig -> mlname`, mlname);
        if (mlname.includes('vessel')) {
            config.push(mods[0].id);
            // console.log(`      createRandomConfig -> mods[0].id`, mods[0].id);
        } else {
            config.push(mods[Math.floor(Math.random()*mods.length)].id);
        }
    })
    // console.log(`        createRandomConfig -> config`, config);
    // array of four square item ids
    return (config);
}

function createConeFromConfig(mods) {
    var coneconfig={toppings:[]};
    mods.forEach((m) => {
        var mod=catalog.byId[m];
        if (mod && mod.modifier_data) {
            var mlname=catalog.byId[mod.modifier_data.modifier_list_id].modifier_list_data.name;
            var modname=stripName(mod.modifier_data.name);
            if (mlname.includes('topping')) {
                coneconfig.toppings.push(modname);
            }

            else {
                if (mlname.includes('vessel')) name='vessel';
                if (mlname.includes('flavor')) name='flavor';
                if (mlname.includes('dip')) name='dip';    
                coneconfig[name]=modname;    
            }
        }
    });

    const postfix='?width=1024&auto=webp';

    const flavor=`url(/cone-builder/${coneconfig.flavor}-soft-serve.png${postfix})`;
    const vesself=`url(/cone-builder/${coneconfig.vessel}-front.png${postfix})`;
    const vesselb=`url(/cone-builder/${coneconfig.vessel}-back.png${postfix})`;
    const dip=`url(/cone-builder/${coneconfig.dip}-dip.png${postfix})`;
    let toppings='';
    coneconfig.toppings.forEach((t, i) => {
        let topping=`url(/cone-builder/${t}-topping.png${postfix})`;
        if (t.includes('cotton') && coneconfig.vessel.includes('cup')) {
            topping=`url(/cone-builder/${t}-topping-cup.png${postfix})`;
        };
        toppings=`${topping}`+(i?', ':'')+toppings;    
    })

    html=`<div style="background-image: ${vesselb}">
        <div style="background-image: ${flavor}">
        <div style="background-image: ${dip}">
        <div style="background-image: ${toppings}">
        <div style="background-image: ${vesself}">
        </div>
        </div>
        </div>
        </div>
        </div>`;
    
    return html;

}

function coneBuilderFlow() {
    return ["variation", "vessel", "flavor", "dip", "topping"];
}

function coneBuilderShow(name) {
    var $current=document.querySelectorAll("div.cb-selection").forEach(($e) => {
        if ($e.getAttribute('data-name') == name) {
            $e.classList.remove('hidden');
            $e.classList.add('visible');
            adjustScrolling($e.querySelector('.selected'));
        } else {
            $e.classList.add('hidden');
            $e.classList.remove('visible');
        }
    })

    var flow=coneBuilderFlow();

    if (name==flow[0]) hide("cb-back");
    else show("cb-back");

    if (name==flow[flow.length-1]) {
        hide("cb-next");
        show("cb-addtocart");
    } else {
        show("cb-next");
        hide("cb-addtocart");
    }
}

function coneBuilderBack() {
    var $current=document.querySelector("div.cb-selection.visible");
    var flow=coneBuilderFlow()
    var index=flow.indexOf($current.getAttribute('data-name'));
    if (index>=1) coneBuilderShow(flow[index-1]);
}
function show(id) {
    document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
    document.getElementById(id).classList.add("hidden");
}

function coneBuilderNext() {
    var $current=document.querySelector("div.cb-selection.visible");
    var flow=coneBuilderFlow()
    var index=flow.indexOf($current.getAttribute('data-name'));
    if (index<flow.length-1) coneBuilderShow(flow[index+1]);
}


function getConeBuilderHTML(item, callout) {
    let html='';
    html+=`<div class="close" onclick="hideConfig()"><svg class="icon icon-close"><use href="/icons.svg#close"></use></svg></div><div class="wrapper">`;
    html+=`<div id="cone-builder">
        </div>`;

        html+=`<div class="cb-controls"><div class="cb-selections">`;
        html+=`<div class="cb-selection visible" data-name="variation" value=""><h4>pick your size</h4><div class="cb-options smooth">`;
        item.item_data.variations.forEach((v, i) => {
            var price=v.item_variation_data.price_money.amount;
            price=price?`<br><span class="price">($${formatMoney(price)})</span>`:'';
            html+=`<span data-id="${v.id}" class="${i?"":"selected"}" onclick="coneBuilderSelect(this)">${v.item_variation_data.name}${price}</span>`;
        });
        html+=`</div></div>`;
        if (item.item_data.modifier_list_info) {
            item.item_data.modifier_list_info.forEach((m) => {
                var ml=catalog.byId[m.modifier_list_id];
                var name=ml.modifier_list_data.name;
                if (name.includes('vessel')) name='vessel';
                if (name.includes('flavor')) name='flavor';
                if (name.includes('dip')) name='dip';
                if (name.includes('topping')) name='topping';

                let title=`pick your ${name}`;
                
                // html+=`<h3>${ml.modifier_list_data.name}</h3>`;
                html+=`<div class="cb-selection hidden" data-name="${name}"><h4>${title}</h4><div class="cb-options smooth">`;
                ml.modifier_list_data.modifiers.forEach((mod, i) => {
                    var price=mod.modifier_data.price_money.amount;
                    price=price?`<br><span class="price">(+$${formatMoney(price)})</span>`:'';
                    var modname=mod.modifier_data.name.replace('(v)','<svg><use href="/icons.svg#v"></use></svg>');
                    modname=modname.replace('(gf)','<svg><use href="/icons.svg#gf"></use></svg>');
                    html+=`<span onclick="coneBuilderSelect(this)" data-id="${mod.id}" class="${i?"":"selected"}">${modname}${price}</span>`;
                })
            html+=`</div></div>`;
            });    
        }
        html+=`</div>
            <div class="cb-buttons">
               <div id="cb-back" class="hidden" onclick="coneBuilderBack()"><svg class="icon icon-back"><use href="/icons.svg#back"></use></svg></div>
               <div id="cb-next" onclick="coneBuilderNext()"><svg class="icon icon-next"><use href="/icons.svg#next"></use></svg></div>
               <div id="cb-addtocart" class="hidden" onclick="addConeToCart()"><h3>add to cart</h3></div>
            </div>
          </div>
        </div>`;

        return (html);
    }

function getConfigHTML(item, callout) {
    // console.log(`\ngetConfigHTML is running`)
    // console.log(`getConfigHTML -> item`, item);
    // console.log(`getConfigHTML -> item.item_data.variations`, item.item_data.variations);
    let html='';
    var pickupVars=isFixedPickup(item);
    var image="";

    if (item.item_data.variations[0].item_variation_data.name.indexOf('day ')>0) {
        pickupVars=true;
    }

    if (item.image_id) {
        var imgobj=catalog.byId[item.image_id];
        if (imgobj) {
            image=imgobj.image_data.url;
        } 
    }
    if (image) {
        html+=`<img src="${image}">`;
    }

    html+=`<div class="close" onclick="hideConfig()">X</div><div class="wrapper">`;

    if (pickupVars) {
        html+=`when would you like to pick this up?`
    } else {
        html+=`<h3>customize your ${item.item_data.name}</h3>`;
    }

    html+=callout;

    html+=`<select name="variation">`;
    item.item_data.variations.forEach((v) => {
        html+=`<option value="${v.id}">${v.item_variation_data.name} ($${formatMoney(v.item_variation_data.price_money.amount)})</option>`;
    });
    html+=`</select>`;
    if (item.item_data.modifier_list_info) {
        item.item_data.modifier_list_info.forEach((m) => {
            var ml=catalog.byId[m.modifier_list_id];
            // html+=`<h3>${ml.modifier_list_data.name}</h3>`;
            html+=`<div><select name="${ml.modifier_list_data.name}">`;
            ml.modifier_list_data.modifiers.forEach((mod) => {
                html+=`<option value="${mod.id}">${mod.modifier_data.name} (+$${formatMoney(mod.modifier_data.price_money.amount)})</option>`;
            })
        html+=`</select></div>`;
        });    
    }
    html+=`<button onclick="addConfigToCart()">add to cart</button>
           </div>`;
    
    return html;
}

var touchStartX=0;
var touchEndX=0;
var touchSpeed=0;
var scrollOffsets=[];

function scrollSelection(ev) {
    var $cbs=ev.target.parentNode.parentNode;
    var $options=ev.target.parentNode;

    
    if (ev.type == 'touchstart') {
        touchStartX=ev.touches[0].screenX;
        $options.classList.remove("smooth");
    }
    if (ev.type == 'touchmove') {
        var delta=0;
        delta=touchStartX-ev.touches[0].screenX;
        touchSpeed=touchEndX-ev.touches[0].screenX;
        touchEndX=ev.touches[0].screenX;
        newOffset=scrollOffsets[$cbs.getAttribute('data-name')]-delta;
        $options.style=`transform: translateX(${newOffset}px)`;
        ev.preventDefault();
    }

    if (ev.type == 'touchend') {
        var delta=touchStartX-touchEndX;
        $options.classList.add("smooth");
        newOffset=scrollOffsets[$cbs.getAttribute('data-name')]-delta-touchSpeed*10;
        var left=getScrollingOffset($options.firstChild);
        var right=getScrollingOffset($options.lastChild);

        if (newOffset > left) newOffset=left;
        if (newOffset < right) newOffset=right;


        $options.style=`transform: translateX(${newOffset}px)`;
        scrollOffsets[$cbs.getAttribute('data-name')]=newOffset;
    }
}

function configItem(item, callout) {
    // console.log(`\nconfigItem is running`);
    // console.log(`  configItem -> item`, item);
    // console.log(`  configItem -> callout`, callout);
    var config=document.getElementById("config");
    config.classList.remove("hidden");
    document.body.classList.add("noscroll");
    var html='';
    var name=item.item_data.name;
    // console.log(`    configItem -> name`, name);
    if (name == "lab cone") {
        html=getConeBuilderHTML(item, callout);
        config.classList.add('cone-builder');
        config.innerHTML=html;
        document.querySelectorAll('#config .cb-selection').forEach(($cbs) => {
            $cbs.addEventListener('touchstart', scrollSelection, true);
            $cbs.addEventListener('touchmove', scrollSelection, true);
            $cbs.addEventListener('touchcancel', scrollSelection, true);
            $cbs.addEventListener('touchend', scrollSelection, true);
        });
        updateNumberOfToppings();
        showConfig();
        adjustScrolling(document.querySelector('#config.cone-builder .cb-options .selected'));
    } else {
        html=getConfigHTML(item, callout);
        config.classList.remove('cone-builder');
        config.innerHTML=html;
    }
}
    

function showConfig() {
    const cb=document.getElementById("cone-builder");
    if (cb) {
        var mods=[];
        document.querySelectorAll('#config.cone-builder .cb-options .selected').forEach((e) => {
            mods.push(e.getAttribute('data-id'));
        });
        cb.innerHTML=createConeFromConfig(mods);
    }
}

/* ------
check-out flow (pickup name, cell, time, store opening hours, payment)
--------- */


function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
function toNumbersArray(str) {
    // format string from labels to array
    return (str.split(',').map(e => +e.trim()));
}
function getOpeningHoursConfig() {
    // console.log(`\ngetOpeningHoursConfig is running`);
    // TODO: see if setPickupTimes/setPickupDates can be consolidated 
    // (this func currently runs twice)
    // get opening and closing hours out of labels.json
    var opening=window.labels[storeLocation+'_openinghours'];
    var closing=window.labels[storeLocation+'_closinghours']
    
    // console.log(`  getOpeningHoursConfig -> opening`, opening);
    // console.log(`  getOpeningHoursConfig -> closing`, closing);
    
    // console.log(`  \ngetOpeningHoursConfig -> storeLocations`, storeLocations);
    // console.log(`    getOpeningHoursConfig -> storeLocation`, storeLocation);
    // console.log(`      getOpeningHoursConfig -> storeLocations[storeLocation]`, storeLocations[storeLocation]);
    
    // update storeLocations obj with opening/closing hours from labels.json
    if (opening) {
        storeLocations[storeLocation].openingHours.opening = toNumbersArray(opening);
    }
    if (closing) {
        storeLocations[storeLocation].openingHours.closing = toNumbersArray(closing);
    }
    // console.log(`        getOpeningHoursConfig -> storeLocations[storeLocation].openingHours`, storeLocations[storeLocation].openingHours);
    return storeLocations[storeLocation].openingHours;
}

function setPickupTimes () {
    var date=document.getElementById("pickup-date").value;
    var timeSelect=document.getElementById("pickup-time");
    var conf=getOpeningHoursConfig();
    var now=new Date();
    //var now=new Date("2020-04-15T22:51:00-07:00");

    var today=now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate();
    
    var openingTime=new Date(date);
    openingTime.setHours(conf.opening[openingTime.getDay()]);

    var closingTime=new Date(date);
    closingTime.setHours(conf.closing[closingTime.getDay()]);
    
    var startTime;
    // if same day AND after opening time
    if (today == date && (now.getTime()>openingTime)) {
        startTime=new Date(now.getTime()+(conf.prepTime*60000));
        time=new Date(startTime.getTime()+(10*60000-startTime.getTime()%(10*60000)));
        timeSelect.innerHTML="";
    } else {
        var openingTime=new Date(date);
        openingTime.setHours(conf.opening[openingTime.getDay()]);
        startTime=new Date(openingTime.getTime()+(conf.prepTime*60000));
        time=new Date(startTime.getTime());
        timeSelect.innerHTML="";
    }
    // add pickup time option for every ten minutes from now until closing
    while (time<=closingTime) {
        var option = document.createElement("option");
        option.text = formatTime(time);
        option.value=time.toISOString();
        timeSelect.add(option);
        time=new Date(time.getTime()+10*60000);
    }

}

function displayThanks(payment){

    console.log(`displayThanks -> payment`, payment);
    
    var cartEl=document.getElementById("cart");
    var $receipt;

    cartEl.querySelector(".payment").classList.add("hidden");

    if (storeLocation === "store") {
        var $thankyou=cartEl.querySelector(".thankyou.order-ahead");
        $thankyou.classList.remove("hidden");
        $receipt=$thankyou.querySelector('.receipt-link');
    } else if (storeLocation === "lab") {
        var $thankyou=cartEl.querySelector(".thankyou.callyourname");
        $thankyou.classList.remove("hidden");
        $receipt=$thankyou.querySelector('.receipt-link');
    } else if (storeLocation === "delivery") {
        var $thankyou=cartEl.querySelector(".thankyou.deliverydate-confirm");

        $thankyou.classList.remove("hidden");

        $receipt=$thankyou.querySelector('.receipt-link');
    }

    var receiptLink="/receipt"

    if (payment) {
        receiptLink=payment.receipt_url;
    }

    $receipt.setAttribute("href", receiptLink);

    var recipient = order.fulfillments[0].pickup_details ? 
    order.fulfillments[0].pickup_details.recipient.display_name : order.fulfillments[0].shipment_details.recipient.display_name;

    var textElem=document.getElementById("text-link");
    var msg=`hi normal, this is ${recipient}, picking up my order in a (describe car)`;
    var smshref=`sms://+1${labels.store_phone.replace(/\D/g,'')}/${isAndroid()?"?":"&"}body=${encodeURIComponent(msg)}`;
    textElem.setAttribute("href", smshref);

    cart.clear();
    var summaryEl=document.querySelector("#cart .summary");
    summaryEl.innerHTML=`your cart is empty`;
}

function getTip() {
    var tipPercentage=+document.getElementById("tip").value;
    var tipAmount=Math.round(order.total_money.amount*tipPercentage/100);
    return (tipAmount);
}

function getContactInfo() {
    const $infoDiv = document.getElementById("info");
    // console.log(`getContactInfo -> $infoDiv`, $infoDiv);

    const name = $infoDiv.querySelector("#name").value;
    const cell = $infoDiv.querySelector("#cell").value;
    const email = $infoDiv.querySelector("#email").value;
    // console.log(`getContactInfo ->`, name, cell, email);

    const deliveryAddress = $infoDiv.querySelector("#delivery-address").value;
    const deliveryCity = $infoDiv.querySelector("#delivery-city").value;
    const deliveryState = $infoDiv.querySelector("#delivery-state").value;
    const deliveryZip = $infoDiv.querySelector("#delivery-zip").value;

    const addressStr = `${deliveryAddress}, ${deliveryCity}, ${deliveryState} ${deliveryZip}`;
    // console.log(`getContactInfo ->`, deliveryAddress, `\n`, deliveryCity, deliveryState, deliveryZip);

    const deliveryDate = $infoDiv.querySelector("#pickup-date").value;
    const dateObj = new Date(deliveryDate);

    return {
        name: name,
        email: email,
        deliveryDate: deliveryDate,
        address: addressStr,
    }

}

async function sendConfirmationEmail(name, email, address, date, receipt) {
    const params = `?name=${name}&email=${email}&address=${address}&deliveryDate=${date}&receipt=${receipt}`;
    const url = `https://script.google.com/macros/s/AKfycbznNyX8f4bPZO91yyMidzvyfSpI_BQza5sB11kgKA4BuAX2RI-N/exec${params}`;

    let resp = await fetch(url);
    let data = await resp.json();

    if (data.sent) {
        console.log(`Email confirmation sent to ${email}`);
    } else {
        console.log(`Email confirmation was NOT sent`);
    }

}

// function setDeliveryDates() {

//     const now = new Date();
//     console.log(`setDeliveryDates -> now`, now);

//     const dayOfWeek = {
//         mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6
//     }

//     let deliveryDates = window.labels.delivery_dates;
//     if (deliveryDates.includes(",")) {
//         deliveryDates = deliveryDates.split(", ");
//     } else {
//         deliveryDates = [ deliveryDates ];
//     }
    
//     const orderAheadOptions = window.labels.delivery_orderahead;
//     // console.log(`setDeliveryDates -> orderAheadOptions`, orderAheadOptions);
    
//     let deliveryDeadline = new Date(window.labels.delivery_deadline);
//     // if date from labels in invalid, replace with HARD CODED date below...
//     // TODO: better validate date entry out of google sheet...
//     if (!deliveryDeadline instanceof Date || isNaN(deliveryDeadline)) {
//         deliveryDeadline = new Date("November 24, 2020 17:00:00");
//     }

//     // check if delivery is still open
//     if (now < deliveryDeadline) {
//         let startDate = now;
//         const dayNum = dayOfWeek[startDate.toString().substring(0,3).toLowerCase()];
//         let count = 0;
        
//         while (count < orderAheadOptions) {
//             // find next delivery date
//             for (date of deliveryDates) {

//                 let nextWeek = 0;
//                 // if before today, set to next week...
//                 if (dayNum >= dayOfWeek[date]) {
//                     nextWeek = 7;
//                 }
//                 // console.log(`      setDeliveryDates -> nextWeek`, nextWeek);

//                 let dt = startDate.getDate() - (startDate.getDay() - 1) + dayOfWeek[date] + nextWeek; 
//                 let nextDt = new Date(startDate.setDate(dt));
                
//                 //console.log(`        setDeliveryDates -> today!`, new Date());
//                 console.log(`        setDeliveryDates -> nextDt`, nextDt);
                
//                 count++;
//                 console.log(`setDeliveryDates -> startDate`, startDate);
//             }
//             // add dates for next week
//             startDate.setDate(startDate.getDate() + 7);
            
//         }

//     }

   

// }

function setPickupDates () {
    //var now=new Date("2020-04-15T22:51:00-07:00");
    var now = new Date();
    var i = 0;

    var day = now;
    var conf = getOpeningHoursConfig();

    var weekdays = ["sun","mon","tue","wed","thu","fri","sat"];
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var dateSelect = document.getElementById("pickup-date");
    const deliveryOptionsLength = document.getElementById("pickup-date").options.length;

    // TODO: check if closedForToday can/should come off of labels.json
    var closedForToday = false; 
    // if current storeLocation offers "order ahead"
      // lab doesn't, store and delivery do
    if (storeLocations[storeLocation].orderAhead) {

        if (storeLocation === "delivery" && deliveryOptionsLength <= 1) {

            document.querySelector("#pickup-time").classList.add("hidden");
            
            while (i < window.labels.delivery_orderahead) {
                let deliveryDate = day;
                let deliveryMS = Date.parse(deliveryDate);
                // deadline for delivery order is friday @ 5:00pm
                let deadline = deliveryDate.setHours(17, 0, 0, 0); 
                let option = document.createElement("option");

                if (deliveryDate.toString().includes("Fri") && deliveryMS < deadline) {
                    deliveryDate.setHours(17, 0, 0, 0);
                    option.text = weekdays[(deliveryDate.getDay() + 1)] + ", " + months[deliveryDate.getMonth()] + " " + (deliveryDate.getDate() + 1);
                    option.value = deliveryDate.getFullYear() + "/" + ( deliveryDate.getMonth()+1 ) + "/" + (deliveryDate.getDate() + 1);
                    dateSelect.add(option);
                    deliveryDate.setDate(new Date(deliveryDate).getDate() + 1);
                } else {
                    // 5 = saturday, below
                    let dt = deliveryDate.getDate() - (deliveryDate.getDay() - 1) + 5; 
                    let sat = new Date(deliveryDate.setDate(dt))
                    option.text = weekdays[sat.getDay()]+", "+months[sat.getMonth()]+" "+sat.getDate();
                    option.value = sat.getFullYear() + "/" + ( sat.getMonth()+1 ) + "/" + sat.getDate();
                    dateSelect.add(option);
                    deliveryDate.setDate(new Date(sat).getDate() + 1);
                }
                i++;
            }
        } else {
            // not delivery
            while (i<storeLocations[storeLocation].orderAhead) {
                if (i==0) {
                    /* check if we are past cutoff for today */
                    var closingDate=new Date();
                    closingDate.setHours(conf.closing[day.getDay()],0,0,0);
                    if (now > closingDate-conf.lastOrderFromClose*60000) {
                        day.setDate(day.getDate()+1);
                        document.querySelector("#cart .info .pickup-time .warning.hidden").classList.remove("hidden");
                    }
                }
                if (conf.opening[day.getDay()]) {
                    var option = document.createElement("option");
                    option.text = (i==0)?'today':weekdays[day.getDay()]+", "+months[day.getMonth()]+" "+day.getDate();
                    option.value=day.getFullYear()+"/"+(day.getMonth()+1)+"/"+day.getDate();
                    dateSelect.add(option);
                }
    
                day.setDate(day.getDate()+1);
                i++;
            }
            setPickupTimes();
        }

    } else {
        var closingDate=new Date();
        var openingDate=new Date();
        closingDate.setHours(conf.closing[day.getDay()],0,0,0);
        openingDate.setHours(conf.opening[day.getDay()],0,0,0);

        var option = document.createElement("option");
        option.text = 'today';
        option.value=day.getFullYear()+"/"+(day.getMonth()+1)+"/"+day.getDate();
        dateSelect.add(option);

        setPickupTimes();

        if (now>closingDate-conf.lastOrderFromClose*60000) {
            document.querySelector("#cart .info").classList.add("hidden");
            document.querySelector("#cart .warning.toolate").classList.remove("hidden");
        }
        if (now<openingDate) {
            document.querySelector("#cart .info").classList.add("hidden");
            document.querySelector("#cart .warning.tooearly").classList.remove("hidden");
        }
    }
}

function setDeliveryZipCodes() {
    const zipArr = toNumbersArray(window.labels.delivery_zipcodes).sort();
    const $zipSelect = document.getElementById("delivery-zip");

    zipArr.forEach((zip) => {
        let option = document.createElement("option");
        option.text = zip;
        option.value = zip;
        $zipSelect.add(option);
    });
}

function setZipColor() {
    const $zipSelect = document.getElementById("delivery-zip");
    if ($zipSelect.value !== "") {
        $zipSelect.style.color = "var(--text-color)";
    }
}

var paymentForm;

function initPaymentForm() {
        
    // Create and initialize a payment form object
    paymentForm = new SqPaymentForm({
        // Initialize the payment form elements
        
        applicationId: "sq0idp-q-NmavFwDX6MRLzzd5q-sg",
        locationId: storeLocations[storeLocation].locationId,

        inputClass: 'sq-input',
        autoBuild: false,
        // Customize the CSS for SqPaymentForm iframe elements
        inputStyles: [{
            fontFamily: 'sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            padding: '16px',
            placeholderColor: '#a0a0a0',
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
            backgroundColor: 'transparent',
        }],
        // Initialize the credit card placeholders
        cardNumber: {
            elementId: 'sq-card-number',
            placeholder: 'Card Number'
        },
        cvv: {
            elementId: 'sq-cvv',
            placeholder: 'CVV'
        },
        expirationDate: {
            elementId: 'sq-expiration-date',
            placeholder: 'MM/YY'
        },
        postalCode: {
            elementId: 'sq-postal-code',
            placeholder: 'Postal'
        },
        
        // SqPaymentForm callback functions
        callbacks: {
            /*
            * callback function: cardNonceResponseReceived
            * Triggered when: SqPaymentForm completes a card nonce request
            */
            cardNonceResponseReceived: function (errors, nonce, cardData) {
            if (errors) {
                // Log errors from nonce generation to the browser developer console.   
                console.error('Encountered errors:');
                errors.forEach(function (error) {
                    alert(error.message);
                    console.error('  ' + error.message);
                });
                submittingPayment=false;
                return;
            }
            //    console.log(`The generated nonce is:\n${nonce}`);
    
                var tipAmount=getTip();
    
                var qs=`nonce=${encodeURIComponent(nonce)}&order_id=${encodeURIComponent(order.id)}&reference_id=${encodeURIComponent(order.reference_id)}&order_amount=${order.total_money.amount}&tip_amount=${tipAmount}`;   
    
                fetch(storeLocations[storeLocation].endpoint+'?'+qs, {
                    method: 'GET',
                    headers: {
                    'Accept': 'application/json',
                    }
                })
                .catch(err => {
                    alert('Network error: ' + err);
                    submittingPayment=false;
                })
                .then(response => {
                    if (!response.ok) {
                    return response.text().then(errorInfo => Promise.reject(errorInfo));
                    }
                    return response.text();
                })
                .then(data => {
                //   console.log(data);
                    var obj=JSON.parse(data);
                    if (typeof obj.errors != "undefined") {
                        var message='Payment failed to complete!\nCheck browser developer console for more details';
                        if (obj.errors[0].category=='PAYMENT_METHOD_ERROR') {
                            message='Credit Card declined, please check your entries';
                        }
                        if (obj.errors[0].code =='CVV_FAILURE') {
                        message='Credit Card declined, please check your CVV';
                        }
                        if (obj.errors[0].code =='PAN_FAILURE') {
                        message='Credit Card declined, please check your card number';
                        }

                        if (obj.errors[0].code =='VOICE_FAILURE') {
                        message='Credit Card declined, issuer requires voice authorization, try a different card';
                        }

                        if (obj.errors[0].code =='TRANSACTION_LIMIT') {
                        message='Credit Card declined, limit exceeded';
                        }

                        alert(message);
                    submittingPayment=false;
                    } else {
                        console.log(`initPaymentForm -> obj`, obj);
                        displayThanks(obj.payment);
                        if (storeLocation === "delivery") {
                            // send delivery confirmation email here
                            // const info = getContactInfo();
                            // sendConfirmationEmail(info.name, info.email, info.address, info.deliveryDate);
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                });          
                }
        }
    });
    
    paymentForm.build();      
}

var giftCardForm;

function initGiftCardForm() {

    giftCardForm = new SqPaymentForm({
        applicationId: "sq0idp-q-NmavFwDX6MRLzzd5q-sg",
        locationId: storeLocations[storeLocation].locationId,

        inputClass: 'sq-input',

        giftCard: {
          elementId: 'sq-gift-card',
          placeholder: "* * * *  * * * *  * * * *  * * * *"
        },

        inputStyles: [{
            fontFamily: 'sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            padding: '16px',
            placeholderColor: '#a0a0a0',
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
            backgroundColor: 'transparent',
        }],

        callbacks: {
          cardNonceResponseReceived: function (errors, nonce, paymentData, contacts) {
            if (errors) {
          //   Log errors from nonce generation to the browser developer console.
              console.error('Encountered errors on gift card nonce received:');
              errors.forEach(function (error) {
                console.error('  ' + error.message);
              });
              alert('Encountered errors, check console for more details');
              return;
            } 

            var tipAmount=getTip();
      
            var qs=`nonce=${encodeURIComponent(nonce)}&order_id=${encodeURIComponent(order.id)}&reference_id=${encodeURIComponent(order.reference_id)}&order_amount=${order.total_money.amount}&tip_amount=${tipAmount}`;

            fetch(storeLocations[storeLocation].endpoint + "?" + qs, {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            })
            .catch((err) => {
                alert("Network error: " + err);
                submittingPayment = false;
            })
            .then((response) => {
                if (!response.ok) {
                  return response
                    .text()
                    .then((errorInfo) => Promise.reject(errorInfo));
                }
                if (response.status !== undefined && response.status === "'FAILED`") {
                    alert('Card denied:' + response.errors[0].code);
                    return;
                }
                //If there is a balance remaining on the purchase, collect a
                // credit or debit card and pass the ID of the Order so that the
                //payment card nonce is posted in the context of the order

                // TODO: FIX -- this doesn't work!

                if ( response.balance !== undefined && response.balance > 0) {
                  //Notify buyer of remaining balance and ask for another card.
                  alert('Gift card authorized. Additional payment of '
                  + response.balance + ' needed.');
                }
                
                return response.text();
            })
            .then((data) => {
                //   console.log(data);
                var obj = JSON.parse(data);
                if (typeof obj.errors != "undefined") {
                  console.log(obj.payment);
                  var message =
                    "Payment failed to complete!\nCheck browser developer console for more details";

                  alert(message);
                  submittingPayment = false;
                } else {
                    console.log(`initGiftCardForm -> obj`, obj);
                    displayThanks(obj.payment);
                    if (storeLocation === "delivery") {
                        // send delivery confirmation email here
                        // const info = getContactInfo();
                        // sendConfirmationEmail(info.name, info.email, info.address, info.deliveryDate);
                    }
                }
            })
            .catch((err) => {
                console.error(err);
            }); 
            
          }
        }
    });
    
    giftCardForm.build();

}

function onGetCardNonce(event) {
    if (!submittingPayment) {
        submittingPayment=true;
        event.preventDefault();
        paymentForm.requestCardNonce();    
    }
}

function submitGiftCardClick(event) {
    if (!submittingPayment) {
        submittingPayment=true;
        event.preventDefault();
        giftCardForm.requestCardNonce();    
    }
}

function togglePaymentOptions() {
    const $giftCardBox = document.getElementById('pay-with-gift-card');

    const $giftCardForm = document.getElementById('giftcard-form');
    const $creditCardForm = document.getElementById('creditcard-form');

    if ($giftCardBox.checked) {
        $giftCardForm.classList.remove('hidden');
        $creditCardForm.classList.add('hidden');
    } else {
        $creditCardForm.classList.remove('hidden');
        $giftCardForm.classList.add('hidden');
    }
}

storeLocation="";
// TODO: find out why opening and closing hours are nested in "openingHours" obj
storeLocations={
    store: { 
        endpoint: "https://script.google.com/macros/s/AKfycbzPFOTS5HT-Vv1mAYv3ktpZfNhGtRPdHz00Qi9Alw/exec",
        locationId: "6EXJXZ644ND0E",
        openingHours: { opening: [12,12,12,12,12,12,12],
            closing: [20,20,20,20,20,20,20],
            lastOrderFromClose: 0,
            prepTime: 0
        },
        orderAhead: 10,
        link: "/store", 
        address: "169 E 900 S in SLC"
    },
    lab: {
        endpoint: "https://script.google.com/macros/s/AKfycbyQ1tQesQanw1Dd13t0c7KLxBRwKTesCfbHJQdHMMvc02aWiLGZ/exec",
        locationId: "3HQZPV73H8BHM",
        openingHours: { opening: [12,12,12,12,12,12,12],
            closing: [22,22,22,22,22,22,22],
            lastOrderFromClose: 0,
            prepTime: 0
        },    
        link: "/lab",
        address: "inside the east entrance of trolley square, 602 700 E in SLC, UT"
    },
    delivery: {
        endpoint: "https://script.google.com/macros/s/AKfycbwXsVa_i4JBUjyH7DyWVizeU3h5Rg5efYTtf4pcF4FXxy6zJOU/exec",
        locationId: "WPBKJEG0HRQ9F",
        openingHours: {
            opening: [0, 0, 0, 0, 0, 0, 0],
            closing: [24, 24, 24, 24, 24, 24, 24],
            // lastOrderFromClose: 0,
            // prepTime: 0
        },
        orderAhead: 2, // allow delivery up to two weeks in advance
        link: "/delivery",
        // address: null
    }
}

order={};
submittingPayment=false;

function checkDiscount(e) {
    if (catalog.discounts[e.value.toLowerCase()]) {
        e.setAttribute("data-id", catalog.discounts[e.value.toLowerCase()].id);
        e.classList.add("valid");
    } else {
        e.setAttribute("data-id", "");
        e.classList.remove("valid");
    }
}

async function checkCart() {
    const fetchURL = `/${storeLocation}`;
    const resp = await fetch(fetchURL, { cache: 'reload', mode: 'no-cors' });
    const html = await resp.text();

    const $cartCheck = document.createElement('div');
    $cartCheck.innerHTML = html;
    
    let oosLIs = []; // container for out-of-stock line items

    // compare line item variation ids from cart to deleted item ids
    cart.line_items.forEach(li => {
        // console.log(`checkCart -> li`, li);
        const variation = catalog.byId[li.variation];
        const itemId = catalog.byId[variation.item_variation_data.item_id].id;

        // if (delItemIds.includes(itemId)) {
        if ($cartCheck.querySelector(`del a[href*="${itemId}"]`)) {
            // console.log(`this item is OUT OF STOCK`);
            oosLIs.push(li);
            li.quantity = 'OUT OF STOCK'
        } 
        
    });
    return oosLIs;
}

function displayStoreAlert() {

    labels = window.labels;
    
    var $storealert = document.createElement('div');
    $storealert.id = "alert";
    $storealert.innerHTML = `<h3>${labels[storeLocation+'_youareorderingfrom']}</h3>`
    $storealert.innerHTML += `<svg><use href="/icons.svg#${storeLocation}"></use></svg>`

    if (storeLocation !== "delivery") {

        // verify store selection
        var other = (storeLocation == 'lab') ? 'store' : 'lab';
        // TODO: fix otherLink below (not working for store)
        var otherLink = storeLocations[other].link;
        
        $storealert.innerHTML += `<p>${labels[storeLocation+'_ourlocationis']}</p>
        <p><button onclick="submitOrder()">${labels[storeLocation+'_yes']}</button></p>
        <p><a href="${otherLink}">${labels[storeLocation+'_ohno']}</a></p>`

    } else {
        // SAVE: if delivery is going to be added to store/lab...
        /* const locations = ['store', 'lab', 'delivery'];
        const otherLocations = locations.filter((location) => { 
            return location !== storeLocation 
        }); */

        let otherLinks = `<p><a href="${storeLocations['store'].link}">${labels['lab_ohno']}</a></p>
        <p><a href="${storeLocations['lab'].link}">${labels['store_ohno']}</a></p>`;

        $storealert.innerHTML 
            += `<p>${labels[storeLocation+'_ourdeliverywindowis']}</p>
            <p><button onclick="submitOrder()">${labels[storeLocation+'_yes']}</button></p>
            ${otherLinks}`;

    }

    document.querySelector('footer').appendChild($storealert);
}

async function submitOrder() {
    // console.log(`submitOrder running`);
    removeOOS();
    var alertEl=document.getElementById("alert").remove();
    var cartEl=document.getElementById("cart");

    var orderParams={};
    var now=false;
    orderParams.pickup_at=document.getElementById("pickup-time").value || "delivery";
    if (orderParams.pickup_at=="now") {
        now=true;
        orderParams.pickup_at=new Date().toISOString();
        orderParams.now="yes";
    } else if (orderParams.pickup_at === "delivery") {
        delete orderParams.pickup_at; // remove pickup from delivery orders
        orderParams.email_address = document.getElementById("email").value;
        // if the email address is missing
        if (orderParams.email_address=="") {
            document.getElementById("email").focus();
            return;
        }
        
        // auto-add shipping to delivery orders
        if (!cart.line_items.some(item => item.variation === 'GTMQCMXMAHX4X6NFKDX5AYQC')) {
            cart.add("GTMQCMXMAHX4X6NFKDX5AYQC");
        }

        const deliveryDate = document.getElementById("pickup-date").value;
        orderParams.deliver_at = new Date(deliveryDate).toISOString();

        const deliveryAddress = document.getElementById("delivery-address").value;
        const deliveryCity = document.getElementById("delivery-city").value; 
        const deliveryState = document.getElementById("delivery-state").value; 
        const deliveryZip = document.getElementById("delivery-zip").value;
        const deliveryFullAddress = [deliveryAddress, deliveryCity, deliveryState, deliveryZip];
        // if the address is missing any piece
        if (deliveryFullAddress.includes("")) {
            document.getElementById("delivery-address").focus();
            return;
        }
        orderParams.address = deliveryAddress;
        orderParams.city = deliveryCity;
        orderParams.state = deliveryState;
        orderParams.zip = deliveryZip;
    }
    orderParams.display_name=document.getElementById("name").value;
    orderParams.cell=document.getElementById("cell").value;
    orderParams.reference_id=generateId();
    orderParams.discount_name=document.getElementById("discount").value;
    orderParams.discount=document.getElementById("discount").getAttribute("data-id");

    // console.log(`  submitOrder -> orderParams`, orderParams);

    if (cart.itemCount==0) return;
    if (orderParams.display_name=="") {
        document.getElementById("name").focus();
        return;
    }
    if (orderParams.cell=="") {
        document.getElementById("cell").focus();
        return;
    }
    if (orderParams.discount=="" && orderParams.discount_name) {
        document.getElementById("discount").focus();
        alert("we don't recognize this discount anymore, typo?");
        return;
    }

    localStorage.setItem("name",orderParams.display_name);
    localStorage.setItem("cell",orderParams.cell);
    localStorage.setItem("address",orderParams.address);

    cartEl.querySelector(".lineitems").classList.add("hidden");
    cartEl.querySelector(".checkoutitems").classList.add("hidden");
    cartEl.querySelector(".info").classList.add("hidden");
    var orderEl=cartEl.querySelector(".order");
    orderEl.classList.remove("hidden");
    orderEl.innerHTML=`<div class="ordering"><svg><use href="/icons.svg#normal"></use></svg></div>`;

    var nomore = await checkCart();
    // console.log(`submitOrder -> nomore`, nomore);

    if (nomore.length>0) {
        var sorry="we are so sorry we just ran out of "
        nomore.forEach((li, i) => {
        // console.log(`submitOrder -> li`, li);
            var v=catalog.byId[li.variation];
            var item=catalog.byId[v.item_variation_data.item_id];
                sorry+=(i?", ":"")+item.item_data.name+" : "+v.item_variation_data.name;
            cart.remove(li.fp);
        })
        sorry+=". we will refresh the store so you can look for alternatives. so sorry.";
        alert(sorry);
        window.location.reload();
        return;
    }
    
    orderParams.line_items=[];
    cart.line_items.forEach((li) => { 
        // console.log(`submitOrder -> li`, li);
        var mods=[];
        li.mods.forEach((m) => mods.push({"catalog_object_id": m}));
        var line_item={
            "catalog_object_id": li.variation,
            "quantity": ""+li.quantity };

        if (mods.length) {
            line_item.modifiers=mods;
        }
        orderParams.line_items.push(line_item);       
    });

    // console.log ("order: "+JSON.stringify(orderParams));

    var qs="";
    for (var a in orderParams) {
        if (a=="line_items") {
            qs+=a+"="+encodeURIComponent(JSON.stringify(orderParams[a]));
        } else {
            qs+=a+"="+encodeURIComponent(orderParams[a]);
        }
        qs+="&";
    }

    // console.log ("order qs: "+qs);

    fetch(storeLocations[storeLocation].endpoint + "?" + qs, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
    .catch((err) => {
        alert("Network error: " + err);
    })
    .then((response) => {
        // console.log(`\n  submitOrder -> response`, response);
        // console.log(`\n  submitOrder -> response.url`, response.url);
        if (!response.ok) {
          return response.text().then((errorInfo) => Promise.reject(errorInfo));
        }
        // console.log(`  submitOrder -> response.text()`, response.text());
        return response.text();
    })
    .then((data) => {
        // console.log(`\n    submitOrder -> data`);
        // console.log(data);
        var obj = JSON.parse(data);
        // console.log(`    submitOrder -> obj`, obj);
        if (typeof obj.order != "undefined") {
          displayOrder(obj.order);
        } else {
          alert("order submission failed. sorry.");
        }
    })
    .catch((err) => {
        console.error(err);
    });       
}

function displayOrder(o) {
    order=o;
    html=`<h3>order: ${order.reference_id}</h3>`;
    order.line_items.forEach((li) => {
        // print shipping line item differently
        if (li.catalog_object_id === "GTMQCMXMAHX4X6NFKDX5AYQC" || li.name === "shipping + handling") { return; }
        html+=`<div class="line item"><span class="desc">${li.quantity} x ${li.name} : ${li.variation_name}</span> <span class="amount">$${formatMoney(li.base_price_money.amount*li.quantity)}</span></div>`;
        if (typeof li.modifiers !== "undefined") {
            li.modifiers.forEach((mod) => {
                html+=`<div class="line mod"><span class="desc">${mod.name}</span> <span class="amount">$${formatMoney(mod.total_price_money.amount)}</span></div>`;
            })
        }
    });
    if (order.discounts) {
        html+=`<div class="line discounts"><span class="desc">${order.discounts[0].name} - discount</span><span class="amount">- $${formatMoney(order.discounts[0].applied_money.amount)}</span></div>`;
    }
    html+=`<div class="line subtotal"><span class="desc">subtotal</span><span class="amount">$${formatMoney(order.total_money.amount)}</span></div>`;
    html+=`<div class="line tax"><span class="desc">prepared food tax (included)</span><span class="amount">$${formatMoney(order.total_tax_money.amount)}</span></div>`;
    
    // if cart includes delivery fee...
    if (cart.line_items.some(item => item.variation === 'GTMQCMXMAHX4X6NFKDX5AYQC')) {
        var shipping = order.line_items.filter(item => item.catalog_object_id === "GTMQCMXMAHX4X6NFKDX5AYQC")[0];
        // console.log(shipping);
        html+=`<div class="line shipping"><span class="desc">${shipping.name} (${shipping.variation_name})</span><span class="amount">$${formatMoney(shipping.base_price_money.amount*shipping.quantity)}</span></div>`
    }

    html+=`<div class="line tip"><span class="desc">tip</span><span class="amount">$${formatMoney(getTip())}</span></div>`;
    html+=`<div class="line total"><span class="desc">total</span><span class="amount">$${formatMoney(order.total_money.amount+getTip())}</span></div>`;
    document.querySelector("#cart .order").innerHTML=html;
    if (!storeLocations[storeLocation].orderAhead) {
        document.querySelector('#cart .payment .wegotyourorder').classList.remove('hidden');
    }

    var paymentEl=document.querySelector("#cart .payment");
    paymentEl.classList.remove("hidden");

    // if credit card
    initPaymentForm();

    // if gift card
    initGiftCardForm();

    if (storeLocation =='lab') {
        const readyText = 'i am here, ready to pick-up my order';
        document.getElementById('sq-creditcard').innerHTML = readyText;
        document.getElementById('sq-giftcard').innerHTML = readyText;
    }
}



/* ------
shopping cart (configs, variations, modifiers, price, quantity)
--------- */

function addConeToCart(e) {
    var variation="";
    var mods=[];
    document.querySelectorAll(`#config.cone-builder .cb-options .selected`).forEach((e, i) => {
        if (!i) {
            variation=e.getAttribute('data-id');
        } else {
            if (e.getAttribute('data-id')) mods.push(e.getAttribute('data-id'));
        }
    })
    
    document.getElementById('cone-builder').classList.add('flyout');
    hideConfig();
    cart.add(variation, mods)
    updateCart();
}

function addConfigToCart(e) {
    hideConfig();
    var variation="";
    var mods=[];
    document.querySelectorAll(`#config select`).forEach((e, i) => {
        if (!i) {
            variation=e.value;
        } else {
            if (e.value) mods.push(e.value);
        }
    })
    cart.add(variation, mods)
    updateCart();
}

// toggles non-empty cart
async function toggleCartDisplay() { 
    var cartEl=document.getElementById("cart");
    // if $cartEl's classlist DOES NOT INCLUDE "full"
    if (cartEl.classList.toggle("full")) {
        document.body.classList.add("noscroll");
        cartEl.querySelector(".summary").innerHTML = 
            `<p class="dotdotdot">${window.labels.checkout_checkstock}<span>.</span><span>.</span><span>.</span><p>`;
        let outOfStock = await checkCart();
        updateCart(); 
        cartEl.querySelector(".summary").classList.add("hidden");
        cartEl.querySelector(".details").classList.remove("hidden");
        // if $cartEl's classlist INCLUDES "full"
    } else {
        updateCart(); 
        document.body.classList.remove("noscroll");
        cartEl.querySelector(".summary").classList.remove("hidden");
        cartEl.querySelector(".details").classList.add("hidden");
    }
    // show delivery address for delivery orders
    if (storeLocation === "delivery") { 
        cartEl.querySelector(".delivery-address").classList.remove("hidden"); 
        document.getElementById("email").classList.remove("hidden"); 
    }
    cartEl.querySelector(".lineitems").classList.remove("hidden");
    cartEl.querySelector(".checkoutitems").classList.remove("hidden");
    cartEl.querySelector(".info").classList.remove("hidden");
    cartEl.querySelector(".order").classList.add("hidden");
    cartEl.querySelector(".payment").classList.add("hidden");
    cartEl.querySelector(".thankyou.callyourname").classList.add("hidden");
    cartEl.querySelector(".thankyou.order-ahead").classList.add("hidden");
    cartEl.querySelector(".thankyou.deliverydate-confirm").classList.add("hidden");

    setPickupDates();
    
    const zipOptionsLength = document.getElementById("delivery-zip").options.length;
    
    if (zipOptionsLength <= 1) {
        setDeliveryZipCodes();
    }

    var hidePickup=true;

    if (storeLocations[storeLocation].orderAhead) {
        cart.line_items.forEach((e) => {
            var variation=catalog.byId[e.variation];
            var item=catalog.byId[variation.item_variation_data.item_id];
            if (hidePickup && !isFixedPickup(item)) {
                hidePickup=false;
            }
        })    
    }


    if (hidePickup) {
        document.querySelector("#cart .pickup-time").classList.add("hidden");
    } else {
        document.querySelector("#cart .pickup-time").classList.remove("hidden");
    }
}

async function fetchLabels() {
    if (!window.labels) {
        // fetch labels google sheet from google drive
        var resp=await fetch('/labels.json');
        let json=await resp.json();
        if (json.data) json=json.data;
        window.labels={};
        // store array of objs from google sheet to object of key/text pairs
        json.forEach((e) => {
            window.labels[e.key]=e.text;
            // console.log(e.text);
        })   
    }
    return (window.labels);
}

function initCart() {
    var cartEl=document.getElementById("cart");
    var labels=window.labels;
    var html=`<div class="summary">items in your cart ($) <button onclick="toggleCartDisplay()">check out</button></div>`;
    html+=`<div class="details hidden">
            <div class="back" onclick="toggleCartDisplay()">&lt; ${labels.checkout_backtoshop}</div>
            <div class="lineitems"></div>
            <div class="checkoutitems"></div>
            <div class="info" id="info">
                <input id="name" type="text" placeholder="your name">
                <input id="cell" type="text" placeholder="cell phone">
                <input id="email" type="email" placeholder="your email" class="hidden">
                <div class="delivery-address hidden"> 
                    <input id="delivery-address" type="text" placeholder="your address">
                    <nobr>
                        <input id="delivery-city" type="text" placeholder="your city" >
                        <input id="delivery-state" type="text" value="utah" readonly>
                        <select id="delivery-zip" onchange="setZipColor()">
                            <option style="color: #a9a9a9" value="" disabled selected hidden>your zip code</option>
                        </select>
                    </nobr>
                </div>
                <div class="pickup-time"> 
                    <nobr>
                        <select id="pickup-date" ${storeLocation === "delivery" ? "" : 'onchange="setPickupTimes()"'}></select>
                        <select id="pickup-time"></select>
                    </nobr>
                    <div class="warning hidden">${labels.checkout_afterhours}</div>
                </div>
                <input id="discount" data-id="" type="text" placeholder="discount code?" onkeyup="checkDiscount(this)">
                <div class="warning hidden minorder">
                    <p>${labels.checkout_minorder}${labels.delivery_minorder}.</p>
                </div>
                <button id="orderBtn" onclick="displayStoreAlert()">order</button>
            </div>
            <div class="warning hidden toolate">
                <p>${labels.checkout_toolate}</p>
            </div>
            <div class="warning hidden tooearly">
                <p>${labels.checkout_tooearly}</p> 
            </div>
            <div class="order hidden"></div>
            <div class="payment hidden">
                <div class="tip"><select onchange="displayOrder(order)" id="tip">
                    <option value="0">no tip</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                </select></div>
                <div id="form-container">
                    <div class="wegotyourorder warning hidden">
                        <p>${labels.checkout_ready}</p>
                        <p>${labels.checkout_callyourname}</p>
                    </div>
                    <div class="giftcardcheckbox">
                        <input type="checkbox" id="pay-with-gift-card" name="pay-with-gift-card" onclick="togglePaymentOptions()">
                        <label for="pay-with-gift-card">pay with gift card?</label>
                    </div>
                    <div id="giftcard-form" class="hidden">
                    <p>we are working on getting partial payments set up, but right now we can only process gift card payments for the full order amount!</p>
                    <div id="sq-gift-card"></div>
                    <button id="sq-giftcard" class="button-credit-card" onclick="submitGiftCardClick(event)">pay</button>
                    </div>
                    <div id="creditcard-form">
                    <div id="sq-card-number"></div>
                    <div class="third" id="sq-expiration-date"></div>
                    <div class="third" id="sq-cvv"></div>
                    <div class="third" id="sq-postal-code"></div>
                    <button id="sq-creditcard" class="button-credit-card" onclick="onGetCardNonce(event)">pay</button>
                    <button id="sq-apple-pay"></button>
                    </div>
                </div>             
            </div>
            <div class="thankyou order-ahead hidden">
                <h3 class="warning">${labels.checkout_orderaheadthanks}</h3>
                <p>
                <a id="text-link" href="sms://+1${labels.store_phone.replace(/\D/g,'')}/">${labels.store_phone}</a>
                </p>
                <p>
                <a class="receipt-link" target="_new" href="">show receipt</a>
                </p>
            </div>
            <div class="thankyou callyourname hidden">
                <h3 class="warning">${labels.checkout_pickupnowthanks}</h3>
                <p>
                <a class="receipt-link" target="_new" href="">show receipt</a>
                </p>
            </div>
            <div class="thankyou deliverydate-confirm hidden">
                <h3 class="warning">${labels.checkout_deliverythanks}</h3>
                <p>
                <a class="receipt-link" target="_new" href="">show receipt</a>
                </p>
            </div>
        </div>`;

    cartEl.innerHTML=html;

    var name=getCookie("name");
    var cell=getCookie("cell");

    if (name) {
        setCookie('name','',-10);
        localStorage.setItem('name',name);
        // console.log('migrating name to ls')
    }

    if (cell) {
        setCookie('cell','',-10);
        localStorage.setItem('cell',cell);
        // console.log('migrating cell to ls')
    }

    

    document.getElementById("name").value=localStorage.getItem("name");
    document.getElementById("cell").value=localStorage.getItem("cell");

}

function plus(el) {
  var fp=el.parentNode.parentNode.getAttribute("data-id");
  var li=cart.line_items.find((li) => fp == li.fp);
  if (li.quantity<20) {
      cart.setQuantity(fp, li.quantity+1);
  }
  updateCart();
}

function minus (el) {
    var fp=el.parentNode.parentNode.getAttribute("data-id");
    var li=cart.line_items.find((li) => fp == li.fp);
    cart.setQuantity(fp, li.quantity-1);
    if (li.quantity==0) cart.remove(fp);   
    updateCart();
}

function updateCart() {
    const labels=window.labels;

    var cartEl=document.getElementById("cart");

    var count=cart.totalItems();

    if (count>0) {
        cartEl.classList.remove("hidden");
    } else {
        cartEl.classList.add("hidden");
        document.body.classList.remove("noscroll");
    }

    // check delivery cart
    if (storeLocation === "delivery") {
        // convert dollar amount from google sheet to cents for comparison 
        const minOrder = parseInt(window.labels.delivery_minorder) * 100;
        if (cart.totalAmount() < minOrder) { 
            cartEl.querySelector(".minorder").classList.remove("hidden");
            cartEl.querySelector("#orderBtn").disabled = true;
            cartEl.querySelector("#orderBtn").classList.add("hidden");
        } else {
            cartEl.querySelector(".minorder").classList.add("hidden");
            cartEl.querySelector("#orderBtn").disabled = false;
            cartEl.querySelector("#orderBtn").classList.remove("hidden");
        };
    }

    var summaryEl=cartEl.querySelector(".summary");
    summaryEl.innerHTML=`${count} item${count==1?"":"s"} in your cart ($${formatMoney(cart.totalAmount())}) <button onclick="toggleCartDisplay()">check out</button>`;
    
    var lineitemsEl=cartEl.querySelector(".lineitems");
    let oosMessageDiv = document.createElement("div");
    oosMessageDiv.className = "line item";
    let oosMessage = document.createElement("div");
    oosMessage.setAttribute("id", "oos");
    oosMessage.className = "desc oos";

    // placeholders for ALL out of stock items
    var oosItems = []; 
    var oosItemStr = `oh no, we're out of `;

    var html=``;
    
    cart.line_items.forEach((li) => {
        // console.log(`updateCart -> li`, li);
        var v=catalog.byId[li.variation];
        var i=catalog.byId[v.item_variation_data.item_id];
        var mods="";
        var cone="";
        if (i.item_data.name == 'lab cone' && li.quantity > 0) cone=`<div class="cone">${createConeFromConfig(li.mods)}</div>`;
        li.mods.forEach((m, i) => mods+=", "+catalog.byId[m].modifier_data.name);
        // don't display shipping here
        if (li.quantity > 0 && li.variation !== "GTMQCMXMAHX4X6NFKDX5AYQC") {
            html+=`<div class="line item" data-id="${li.fp}">
            <div class="q"><span onclick="minus(this)" class="control">-</span> ${li.quantity} <span class="control" onclick="plus(this)">+</span></div>
            <div class="desc">${cone} 
            ${i.item_data.name} : ${v.item_variation_data.name} ${mods}</div>
            <div class="amount">$${formatMoney(li.quantity*li.price)}</div>
            </div>`;
        } else if (li.quantity === "OUT OF STOCK") {
            let oosItem;
            if (i.item_data.name == "soft serve") {
                oosItem = `${v.item_variation_data.name} ${i.item_data.name}`;
                oosItems.push(oosItem);
            } else {
                oosItem = `${i.item_data.name}s`;
                oosItems.push(oosItem);
            }
        }
        
    })

    html+=`<div class="line total"><div class="q"></div><div class="desc">total</div><div>$${formatMoney(cart.totalAmount())}</div>`;
    
    lineitemsEl.innerHTML=html;

    // build oos item message, if items in cart are out of stock
    if (oosItems.length) {
      switch (oosItems.length) {
        case 0:
          break;
        case 1:
          oosItemStr += `${oosItems[0]} right now`;
          break;
        case 2:
          oosItemStr += `${oosItems[0]} and ${oosItems[1]} right now`;
          break;
        default:
          for (let i = 0; i < oosItems.length - 1; i++) {
            oosItemStr += `${oosItems[i]}, `;
          }
          oosItemStr += `and ${oosItems[oosItems.length - 1]} right now`;
          break;
      }

      oosMessage.innerHTML += `<div id="oos-close" onclick="removeOOS()"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-close"><use href="/icons.svg#close"></use></svg>`;
      oosMessage.innerHTML += oosItemStr;
      oosMessage.innerHTML += `<br />we've removed them from your cart`;
      oosMessageDiv.append(oosMessage);
      lineitemsEl.prepend(oosMessageDiv);
    }
    
    var checkoutItemsEl=cartEl.querySelector(".checkoutitems");
    html='';

    var coCategory=catalog.categories.find(e => e.category_data.name == 'checkout items '+storeLocation);
    if (coCategory) {
        var coItems=catalog.items.filter(i => i.item_data.category_id == coCategory.id);
        if (coItems.length) {
            html=`<div>${labels.checkout_addtoorder}</div>`;
            coItems.forEach((i) => {
                var price=formatMoney(i.item_data.variations[0].item_variation_data.price_money.amount);
                var id=i.item_data.variations[0].id;
                var name=i.item_data.name;
                var checked=cart.find(id,[])?"checked":"";
                html+=`<div><input type="checkbox" ${checked} value="${id}" onclick="toggleCart(this)">${name} ($${price})</input></div>`; 
            });    
        }
    }

    checkoutItemsEl.innerHTML=html;

}

// remove oos message from screen and oos items from cart
function removeOOS() {
    let OOSEl = document.getElementById("oos");
    if (OOSEl) {
        OOSEl.parentNode.remove();
        cart.line_items.forEach((li) => {
            if (li.quantity === "OUT OF STOCK") {
                // remove item from cart
                cart.remove(li.fp);
            }
        })
    }
    // update cart in local storage
    cart.store();
}

function findCallout($parent) {
    // console.log(`findCallout is running`);
    // console.log(`  findCallout -> $parent`, $parent);
    var callout="";
    var $e=$parent.nextSibling;
    // console.log(`    findCallout -> $e`, $e);
    // console.log(`      findCallout -> $e.tagName`, $e.tagName);
    // console.log(`      findCallout -> $parent.tagName`, $parent.tagName);
    while ($e && $e.tagName != $parent.tagName) {
        if ($e.tagName=="P" && $e.textContent.indexOf("*")==0) {
            // console.log(`        findCallout -> $e.tagName`, $e.tagName);
            // console.log(`        findCallout -> $e.textContent`, $e.textContent);
            callout+=`<p>${$e.textContent}</p>`;        
            // console.log(`          findCallout -> callout`, callout);
        }
        // console.log($e.tagName +":"+$e.textContent)
        // console.log(`            findCallout -> $e.nextSibling`, $e.nextSibling);
        $e=$e.nextSibling;
    }
    // console.log(`\nfindCallout -> callout`, callout);
    return callout;
}

function toggleCart(e) {
    var id=e.getAttribute("value");
    if (e.checked) {
        cart.add(id);
        updateCart();    
    } else {
        cart.remove(id);
        updateCart();    
    }
}

function addToCart(e) {
    var id=e.getAttribute("data-id");
    if (id) {
        var obj=catalog.byId[id]
        if (obj.type=="ITEM") {
            if (obj.item_data.modifier_list_info || (obj.item_data.variations.length>1)) {
                var callout=findCallout(e.parentNode);
                configItem(obj, callout);    
            } else {
                cart.add(obj.item_data.variations[0].id);
                updateCart();    
            }
        } else {
            cart.add(obj.id);
            updateCart();
        }
    }
}

function formatMoney(num) {
    return (""+(num/100).toFixed(2))
}

function stripName(name) {
    // remove dietary markers (v), (gf) and price from item name
    name=name.split('(')[0];
    name=name.split('$')[0];
    return (name.toLowerCase().replace(/[^0-9a-z]/gi, ''))
}

function itemByName(name) {
    name=stripName(name);
    var item=catalog.items.find((i) => {
        return (name == stripName(i.item_data.name));
    })
    return (item);
}

function variationByName(item, name) {
    name=stripName(name);
    var variation=item.item_data.variations.find((i) => {
        var vname=i.item_variation_data.name.toLowerCase();
        vname=vname.split("(")[0].trim();
        vname=stripName(vname);
        return (name == vname);
    })
    return (variation);
}

function makeShoppable() {
    initCart();
    indexCatalog();
    var itemElems=document.querySelectorAll("div.storemenu > *");
    var currentItem={};
    
    var div=document.createElement("div");
    div.innerHTML=`<button class="add-to-cart" onclick="addToCart(this)">add to cart</button>`;
    var addToCartButton=div.firstChild;

    itemElems.forEach((e) => {
        if (e.tagName == "H2") {
            var name=e.innerText;
            name=name.split("$")[0];
            name=name.trim();
            var item=itemByName(name);
            if (item) {
                // console.log(`item: ${item.item_data.name} : ${item.id}`);
                if (item.item_data.modifier_list_info) {
                    var button=addToCartButton.cloneNode(true);
                    button.setAttribute("data-id", item.id);
                    e.appendChild(button);                    
                    var mods=item.item_data.modifier_list_info;
                    mods.forEach((e) => {
                        var mod=catalog.byId[e.modifier_list_id];
                        // console.log(`mod: ${mod.modifier_list_data.name} : ${mod.id}`);
                    });
                    currentItem={};            
                } else {
                    currentItem=item;
                }
            } else {
                // console.log(`item: ${name} not found`);
                currentItem={};            
            }    
        }
        
        if (e.tagName == "H3") {
            if (currentItem.id) {
                var name=e.innerText;
                name=name.trim();
                var variation=variationByName(currentItem, name); 
                if (variation) {
                    // console.log(`variation: ${variation.item_variation_data.name} : ${variation.id}`);
                    var button=addToCartButton.cloneNode(true);
                    button.setAttribute("data-id", variation.id);
                    e.appendChild(button);                    
                } else {
                    // console.log(`variation: ${name} not found`);
                }
   
            } else {
                var name=e.innerText;
                name=name.trim();
                var item=itemByName(name);
                if (item) {
                    // console.log(`item: ${item.item_data.name} : ${item.id}`);
                    var button=addToCartButton.cloneNode(true);
                    if (item.item_data.variations.length>1) {
                        button.setAttribute("data-id", item.id);
                    } else {
                        button.setAttribute("data-id", item.item_data.variations[0].id);
                    }
                    e.appendChild(button);
                }   
            }            
        }
    });

    // square links

    const squareprefix='https://squareup.com/dashboard/items/library/';

    document.querySelectorAll("main a").forEach(($a) => {
    // console.log(`makeShoppable -> $a`, $a);
        var href=$a.getAttribute('href');
        if (href.indexOf(squareprefix)==0) {
            var itemid=href.substr(squareprefix.length);
            $a.setAttribute('data-id', itemid);
            $a.setAttribute('onclick', 'addToCart(this)');
            $a.removeAttribute('href');
            $a.classList.add('item');
            $a.classList.add(stripName(catalog.byId[itemid].item_data.name));
        }
    })
}

var cart={
    line_items: [],
    remove: (fp) => {
        var index=cart.line_items.findIndex((li) => fp == li.fp);
        cart.line_items.splice(index, 1);
        cart.store();
    },
    add: (variation, mods) => {
        if (!mods) mods=[];
        var li=cart.find(variation, mods);
        if (li) {
            li.quantity++;
        } else {
            var fp=variation;
            var price=catalog.byId[variation].item_variation_data.price_money.amount;
            mods.forEach((m) => { fp+="-"+m; price+=catalog.byId[m].modifier_data.price_money.amount});
            cart.line_items.push({fp: fp, variation: variation, mods: mods, quantity: 1, price:  price})
        }
        cart.store();

    },
    find: (variation, mods) => {
        var fp=variation;
        mods.forEach((m) => { fp+="-"+m});
        return cart.line_items.find((li) => fp == li.fp)
    },
    setQuantity: (fp, q) => {
        var index=cart.line_items.findIndex((li) => fp == li.fp);
        cart.line_items[index].quantity=q;
        cart.store();
    },
    totalAmount: () => {
        var total=0;
        cart.line_items.forEach((li)=>{ 
            if (li.quantity > 0) {
                total+=li.price*li.quantity
            }
        })
        return (total);
    },
    totalItems: () => {
        var total=0;
        cart.line_items.forEach((li)=>{ 
            // don't count out-of-stock or shipping
            if (li.quantity > 0 && li.variation !== "GTMQCMXMAHX4X6NFKDX5AYQC") {
                total+=li.quantity
            }
        })
        return (total);
    },
    clear: () => {
        cart.line_items=[];
        cart.store();
    },

    store: () => {
        localStorage.setItem("cart-"+storeLocation,JSON.stringify({lastUpdate: new Date(), line_items: cart.line_items}));
    },

    load: () => {
        var cartobj=JSON.parse(localStorage.getItem("cart-"+storeLocation));
        cart.line_items=[];

        if (cartobj && cartobj.line_items) {
            // validate
            cartobj.line_items.forEach((li) => {
                if (catalog.byId[li.variation]) {
                    var push=true;
                    li.mods.forEach((m) => {
                        if (!catalog.byId[m]) push=false;
                    });
                    if (push) cart.line_items.push(li);
                }
            })
        }
    }
}

/* ---
sign up form
--- */

customerEndpoint="https://script.google.com/macros/s/AKfycbwny6SK6iv7OqtmyM3DcMfwVFQGrVS8V4PaWf4U3kZojtfguns/exec";


function insertSignupForm() {
    var $signup;
    var $form=document.createElement('div');

    var $signup=document.getElementById('sign-up-for-pint-club');
    if ($signup) {
        $signup=$signup.parentNode;
        $form.id='signup';
        $form.className='form';
    
        $form.innerHTML=`<div class="form-wrapper"><input type="text" id="name" placeholder="name">
        <input type="text" id="cell" placeholder="cell">
        <input type="text" id="email" placeholder="email">
        <button onclick="signup()">sign up to pint club</button></div>`;
    
        $signup.parentNode.replaceChild($form, $signup);
        bindInputs(document.querySelectorAll('#signup input'));    
    }
}

function signup() {
    var ValidationException={};

    try {
        var params={};
        document.querySelectorAll('#signup input').forEach((e) => {
            params[e.id]=e.value;
            if (!e.value) {
                e.focus();
                throw ValidationException;
            }
        }) 
        var $signup=document.querySelector("#signup");
        $signup.innerHTML=`<div class="ordering"><svg><use href="/icons.svg#normal"></use></svg></div>`;
    
        var qs="";
        for (var a in params) {
            qs+=a+"="+encodeURIComponent(params[a]);
            qs+="&";
        }
    
        // console.log ("customer qs: "+qs);
    
        fetch(customerEndpoint+'?'+qs, {
            method: 'GET',
            headers: {
            'Accept': 'application/json',
            }
        })
        .catch(err => {
            alert('Network error: ' + err);
        })
        .then(response => {
            if (!response.ok) {
            return response.text().then(errorInfo => Promise.reject(errorInfo));
            }
            return response.text();
        })
        .then(data => {
            // console.log(data);
            var obj=JSON.parse(data);
            if (typeof obj.customer != "undefined") {
                $signup.innerHTML=`<div class="form-wrapper"><p>welcome ${params.name.split(' ')[0].toLowerCase()},<br>
                    we are SO excited to have you as our newest member of NORMAL&reg; PINT CLUB! stay tuned, we'll be in touch shortly.</p></div>`;
            } else {
                alert('Pint Club Signup failed. Sorry.');
            }
        })
        .catch(err => {
            console.error(err);
        });          
    
    } catch (e) {
        // console.log ("validation failed");
    }
}


function hamburger() {
    // open menu on hamburger icon click
    document.querySelector("header .icon-hamburger").addEventListener("click", (e) => {
        document.querySelector("header div:nth-of-type(2)").classList.add("menu-open");       
    })
    // hide menu on close icon
    document.querySelector("header .icon-close").addEventListener("click", (e) => {
        document.querySelector("header div:nth-of-type(2)").classList.remove("menu-open");       
    })
    // expand menu to full width on header nav item click
    document.querySelectorAll("header li a").forEach((li) => {
        li.addEventListener("click", (e) => {
            document.querySelector("header div:nth-of-type(2)").classList.add("clicked");
            return true;
        })
    })
}

function classifyAddToCartLinks() {
    // buttonize 'add to cart' links
    document.querySelectorAll('a').forEach(($a) => {
        if ($a.innerHTML.toLowerCase().trim() == 'add to cart') {
            $a.classList.add('add-to-cart');
        }
    })
}

function addLegacyDivClasses() {
    // select all divs in main element
    document.querySelectorAll('main>div').forEach(($div) => {
        // add class 'image' to images, 'default' to others
        $div.classList.add(($div.firstElementChild && $div.firstElementChild.tagName=='IMG')?'image':'default');
    })
}

function buildIndexGrid() {
    // console.log(`\nbuildIndexGrid running`);
    const indexPaths = [ "/", "/index", "/index.html", "/index2", "/index2.html"];

    if (indexPaths.includes(window.location.pathname)) {
        const $main = document.querySelector(".welcometonormal");
        const $mainChildren = $main.children;
        const mainChildrenArr = [ ...$mainChildren ]
        const $flexContainer = document.createElement("div");
        $flexContainer.classList.add("index-container");
        let tempObj = [];
        let flexItems = []; 

        mainChildrenArr.forEach((child) => {
            if (child.nodeName === "H3") {
                tempObj = [];
                tempObj.push(child);
                flexItems.push(tempObj);
            } else if (child.nodeName !== "H1") {
                tempObj.push(child)
            }
        })
        flexItems.forEach((item) => {
            const heading = item[0].id;
            //console.log(`buildIndexGrid -> heading`, heading);
            const $flexItem = document.createElement("div");
            $flexItem.classList.add("index-item");
            $flexItem.classList.add(heading);
            for (let i = 0; i < item.length; i++) {
                $flexItem.append(item[i]);
            }
            $flexContainer.append($flexItem);
        })
        $main.append($flexContainer);        
    }
}

/* ----
general setup
--- */

window.addEventListener('DOMContentLoaded', async (event) => {
    //resizeImages();
    addLegacyDivClasses();
    await fetchLabels();
    setLocation();
    setColors();
    //fixIcons();
    decorateIcons();
    classify();
    buildIndexGrid();
    hamburger();
    classifyAddToCartLinks();
    // tempSqigFix();
    //wrapMenus();
    //cloneMenuSwiper();
    fixSmsUrls();
    makeShoppable();    
    insertSignupForm();
    cart.load();
    updateCart();

    //setDeliveryDates()
    setEmbedVideo();
});

window.onload = function() {  
    scrani.onload();
}
  
//window.onresize=updateMenuDisplay;
