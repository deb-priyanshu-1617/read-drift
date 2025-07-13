let input = document.querySelector(".inp");
let SearchBtn = document.querySelector(".searchBtn");
let displayDiv = document.querySelector(".displayDiv");

let mgIdArr = [];
let allChaptersArr = [];
let chapterIds = [];
let storeClickChapter = [];

// search event listener 

SearchBtn.addEventListener('click', async () => {
    try {
        displayDiv.innerHTML = displayDiv.innerHTML = `<div class="loader"></div>`;
        let titleSearch = input.value.trim();

        if (!titleSearch){ 
            displayDiv.innerHTML = `<h3>Please enter a manga name to search.</h3>`;
            return ;
        }
        mgIdArr = []; // reset if searched again
        allChaptersArr = []; // reset previous results

        let res = await fetch(`/manga?title=${titleSearch}`);
        let data = await res.json();

        if(!data.data || data.data.length == 0){
            displayDiv.innerHTML = `<h3>manga not found! Search any other Title.</h3>`
        }
      
       
        for(let i = 0; i < data.data.length; i++){
            let mangaId = data.data[i].id;
            mgIdArr.push(mangaId);
        }
        
        StoreAllChapterId();
    
        
   
    } catch (error) {
        console.error("this is error");
    }
});




async function StoreAllChapterId(){
              
              chapterIds = [];
              allChaptersArr = [];

             for(let i = 0; i < mgIdArr.length; i++){
                     let chapterRes = await fetch(`https://api.mangadex.org/chapter?manga=${mgIdArr[i]}&translatedLanguage[]=en&limit=100`);
                     let chapterData = await chapterRes.json();
                       
                     if (!chapterData.data) continue;

                     for(let j = 0; j < chapterData.data.length; j++){
                        let chapter = chapterData.data[j];
                        chapterIds.push(chapter.id);
                        allChaptersArr.push(chapter);
                     }

             }   
         RenderAllChapters();        
}




function RenderAllChapters(){
    
    if (allChaptersArr.length == 0){ 
        displayDiv.innerHTML = `<h1>Currently Not Available!</h1>`; 
    }
    else{
           displayDiv.innerHTML = `<h1>Available chapter!</h1>`;

     allChaptersArr.forEach(chapter =>{
        const chapterNumber = chapter.attributes.chapter;
        const title = chapter.attributes.title;

        let card = document.createElement("div");
        card.className = "chapter-card";
        card.textContent = `Number: ${chapterNumber} --  --------------------------------------------  --Chaper: ${title}`;
        
        displayDiv.appendChild(card);
        
        card.addEventListener("click",()=>{
            storeClickChapter = [];
            storeClickChapter.push(chapter);
            RenderPagesOfClickChapter()
        })

      })
    }     
}

async function RenderPagesOfClickChapter(){

      displayDiv.innerHTML = `<div class="loader"></div>`;

     const chapterID = storeClickChapter[0].id;

     const chapterContent =await fetch(`https://api.mangadex.org/at-home/server/${chapterID}`);
     const chapterInfo = await chapterContent.json() 
     console.log(chapterInfo);

     const baseUrl = chapterInfo.baseUrl;
     const hash = chapterInfo.chapter.hash;
     const data = chapterInfo.chapter.data;
      

     // btn to return the chapter
     let backBtn = document.createElement("button");
     backBtn.textContent = "back";
     backBtn.className = "back-btn";
     
     backBtn.addEventListener("click",()=>{
         RenderAllChapters();
     })
     displayDiv.innerHTML = `<h2>Chapter Pages</h2>`;
     displayDiv.appendChild(backBtn);

    

     data.forEach(filename =>{
          const imageUrl = `${baseUrl}/data/${hash}/${filename}`;

          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = "Manga Page";
          img.className =  "manga-page";
          img.loading = 'lazy';
          displayDiv.appendChild(img);
     })
}


function defaultLoadUI(){
    
}