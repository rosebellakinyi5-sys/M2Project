//Selecting the Elements required from HTML file//

const searchForm= document.getElementById("search-form");
const wordInput= document.getElementById("wordInput");
const searchButton = document.getElementById("searchButton");
const loadingMessage= document.getElementById("loading-message");
const errorMessage= document.getElementById("error-message");
const resultsDiv= document.getElementById("results");
const wordAudio=document.getElementById("word-audio");
const audioBtn= document.getElementById("audio-playback-btn");


//Search Submission//

//This event listener listens in whenever "submit" btn is clicked, this function runs//
searchForm.addEventListener("submit", function(event){
    event.preventDefault();
    //Stops page from reloading//

    const word= wordInput.value.trim();
    //Removes extra spaces from start and end from the users input//

    if  (word === ""){
    console.log("Please enter a word.");
    
    return;
    //The function stops here, no longer fetching.//
    }

    fetchWord(word);
    //If theres a word, proceed to fetching//
    
});


//Fetching word from API//

function fetchWord(word){
    const url= `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    //Has the API URL, a variable and encodeURIComponent to 'fix' the word that the user has put//

    fetch(url)
    //The actual request for data from the URL//

    .then(function (response){
        //This is the response that fetch hands you first before the data//

        if (!response.ok){
            //If request wasnt successful,an error is thrown eg. 404//

            throw new Error("Sorry, word not found");
            //This is the error thrown//
        }
        return response.json();
        //If request was successful, it unpacks the data from the response and proceeds to be used//
    })

    .then(function (data) {
        //This is where the real data is; phonetics, meanings etc//
        console.log("API returned:", data);
        displayWord(data);
    })

    .catch(function (error) {

        console.log("Something went wrong;", error);
        //Unexpected issue, eg. Network failure//
        errorMessage.classList.remove("hidden");
        loadingMessage.classList.add("hidden");
    });

}

audioBtn.addEventListener("click", function (){
    wordAudio.play();
});

//Dispay Results//

function displayWord(data){
    const entry =data[0];
    //Data comes in in an array, index 0 is the first item in the array//

    errorMessage.classList.add("hidden");
    // Removes error message once input is correct//

    //Display the word itself//
    const wordTitle= document.getElementById("word-title");
    //Finds the title in the HTML file//
    wordTitle.textContent= entry.word;
    //Fills it in with text in html//


    const wordPhonetic= document.getElementById("word-phonetic");

    //Not every word comes witha phonetics, so here are conditions//
    if (entry.phonetic){
        wordPhonetic.textContent = entry.phonetic;
        //Fills the phonetic part of a word in html//
    }
   
    else {
        wordPhonetic.textContent="";
        //If it lacks a phonetic,returns undefined//
    }

    resultsDiv.classList.remove("hidden");
    //Removing the css 'hidden' class; makes results now visible//



//Definitions//

const definitionsDiv= document.getElementById("word-definitions");
definitionsDiv.innerHTML="";
//Clears the previous word definitions//

if (entry.meanings){

    entry.meanings.forEach(function (meaning){
        //

        //Created a new div element//
        const meaningBlock= document.createElement("div");
        meaningBlock.className= "meaning";

        //Part of speech//
        const speechHeading= document.createElement("h3");
        speechHeading.textContent= meaning.partOfSpeech;
        //From the data, add the part of speech//
        meaningBlock.appendChild(speechHeading);
        //Push under div//

        //List that will hold definitions//
        const defList= document.createElement("ol");
        defList.className="definitions-list";
        
        if(meaning.definitions){
            meaning.definitions.forEach(function(def){
                const listItem= document.createElement("li");
                listItem.textContent=def.definition;

        if (def.example) {
            const example=document.createElement("p");
            example.className= "example-sentence";
            example.textContent=def.example;
            listItem.appendChild(example);
        }  
        
        defList.appendChild(listItem);
      });
            
    }
        
    meaningBlock.appendChild(defList);
    definitionsDiv.appendChild(meaningBlock);

  });
}
 

resultsDiv.classList.remove("hidden");



//Synonyms//

const wordSynonyms= document.getElementById("word-synonyms");

let allSynonyms=[];
if(entry.meanings){
    entry.meanings.forEach(function (meaning){

        if(meaning.synonyms){
            allSynonyms=allSynonyms.concat(meaning.synonyms);

        }

        if (meaning.definitions){
            meaning.definitions.forEach(function (def){
                if(def.synonyms){
                    allSynonyms= allSynonyms.concat(def.synonyms);
                }
            });
        }
    });
}

//Remove Duplicates//

const uniqueSynonyms= [...new Set(allSynonyms)];

if (uniqueSynonyms.length> 0){
    wordSynonyms.textContent="Synonyms: " + uniqueSynonyms.join(", ");
    wordSynonyms.classList.remove("hidden");
} else {
    wordSynonyms.textContent="";
    wordSynonyms.classList.add("hidden");

}

//Source Link//

const wordSrc= document.getElementById("word-src");

if (entry.sourceUrls && entry.sourceUrls.length>0){
    wordSrc.innerHTML="";
    const sourceLink= document.createElement("a");
    sourceLink.href=entry.sourceUrls[0];
    sourceLink.textContent= "Source";
    sourceLink.target="_blank";

    wordSrc.appendChild(sourceLink);
    wordSrc.classList.remove("hidden");
}

else{
    wordSrc.textContent="";
    wordSrc.classList.add("hidden");

}

//Audio//

let audioUrl="";
if (entry.phonetics){
    entry.phonetics.forEach(function (p){
        if (p.audio && audioUrl ===""){
            audioUrl= p.audio;
        }
    });
}

if (audioUrl !== ""){
    wordAudio.src= audioUrl;
    audioBtn.classList.remove("hidden");
}
else{
    audioBtn.classList.add("hidden");
}
//FAV BTN//

const favBtn= document.getElementById("fav-btn");
favBtn.onclick= function(){
    saveFav(entry.word, entry.phonetic || "");
};
}
//Favorites- Local Storage//

function getFavorites(){
    const stored= localStorage.getItem("favorites");
    if (stored){
        return JSON.parse(stored);

    } else {
        return[];
    }
}
function saveFav(word, phonetic){
    const favorites= getFavorites();

    const alreadySaved=favorites.some(function (fav){
        return favorites.word.toLowerCase() ===word.toLowerCase();
    });

    if (!alreadySaved){
        favorites.push({word: word, phonetic: phonetic});
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
     
    displayFavorites();

}

function removeFavorite(word){
    let favorites=getFavorites();

    favorites= favorites.filter(function (fav){
        return fav.word.toLowerCase() !==word.toLowerCase();
    });
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites(){
    const favoritesList=document.getElementById("favoriteList");
    const noFavoritesMessage=document.getElementById("no-favorite-msg");
    const favorites= getFavorites();

    favoritesList.innerHTML= "";


if (favorites.length===0){
    noFavoritesMessage.classList.remove("hidden");

} else {
    noFavoritesMessage.classList.add("hidden");

    favorites.forEach( function (fav){
        const listItem=document.createElement ("li");
        listItem.className= "favorite-item";

        const wordSpan= document.createElement("li");
        listItem.className= "favorite-item";
        wordSpan.textContent=fav.word;
        wordSpan.addEventListener("click",function(){
            wordInput.value=fav.word
        });

        const removeBtn=document.createElement("button");
        removeBtn.className= "remove-btn";
        removeBtn.type="button";
        removeBtn.textContent="Remove";
        removeBtn.addEventListener("click", function(){
            removeFavorite(fav.word);

        });

        listItem.appendChild(wordSpan);
        listItem.appendChild(removeBtn);
        favoritesList.appendChild(listItem);
    });
  }
}

displayFavorites();