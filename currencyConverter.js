const REST_COUNTRIES_API_KEY='rc_live_538467c321d7464989321ffd45d340cb';
const EXCHANGE_RATES_API_KEY='3e081a00f3cfc4b074079384';

const restCountriesUrl=`https://api.restcountries.com/countries/v5?response_fields=names.common,names.native,names.official,currencies,flag.url_png&limit=100&offset=0&api-key=${REST_COUNTRIES_API_KEY}`;

const resultMessage = document.getElementById('result-message');
const errorMessage = document.getElementById('error-message');
const fromDropdown = document.getElementById('from-dropdown');
const toDropdown = document.getElementById('to-dropdown');
const selectedFromOption=document.getElementById('selected-from-option');
const selectedToOption=document.getElementById('selected-to-option');
const amountInput = document.getElementById('input-amount');
const converterForm = document.getElementById('currency-converter-form');
const convertBtn=document.querySelector('.convert-btn');
const fromOptions=document.getElementById('from-options');
const toOptions=document.getElementById('to-options');

let currencies = [];
let resultTimer;
let errorTimer;
let currenciesLoaded=false;
let fromOptionsPopulated=false;
let toOptionsPopulated=false;

selectedFromOption.addEventListener('click', () => {
    if(!currenciesLoaded){
        alert("Currencies are still loading. Please wait and try again.");
        return;
    }
    if(!fromOptionsPopulated){
        alert("Currencies are still loading. Please wait and try again.");
        populateFromOptions();
        fromOptionsPopulated=true;
    }
    if(fromOptions.style.display==='none'){
        fromOptions.style.display='block';
    }else{
        fromOptions.style.display='none';
    }
});

selectedToOption.addEventListener('click', () => {
    if(!currenciesLoaded){
        alert("Currencies are still loading. Please wait.");
        return;
    }
    if(!toOptionsPopulated){
        alert("Currencies are still loading. Please wait.");
        populateToOptions();
        toOptionsPopulated=true;
    }
    if(toOptions.style.display==='none'){
        toOptions.style.display='block';
    }else{
        toOptions.style.display='none';
    }
});

const disableConvertButton=()=>{
        convertBtn.disabled=true;
        convertBtn.textContent='Converting...';
}
const enableConvertButton=()=>{
    convertBtn.disabled=false;
    convertBtn.textContent='Convert';
}


const displayResult=() =>{
        enableConvertButton();
        clearTimeout(resultTimer);
        resultMessage.classList.remove('hidden');
        resultTimer = setTimeout(() => {
                resultMessage.classList.add('hidden');
        },5000);
}
const displayError=() =>{
        enableConvertButton();
        clearTimeout(errorTimer);
        errorMessage.classList.remove('hidden');
        errorTimer = setTimeout(() => {
                errorMessage.classList.add('hidden');
        },5000);
}

const fetchCountries = async () => {
    try{
        const response = await fetch(restCountriesUrl);
        if(!response.ok){
            displayError();
            return;
        }
        const responseData = await response.json();
        responseData.data.objects.
        filter((country) => country.currencies && country.currencies.length > 0 && country.flag).
        forEach((country) => {
                country.currencies.forEach((currency) => {
                        currencies.push({
                                code: currency.code,
                                name: currency.name,
                                flag: country.flag.url_png
                        });
                });
        });
        currencies.sort((a,b) => {
                if(a.code < b.code) return -1;
                if(a.code > b.code) return 1;
                return 0;
        });
        currenciesLoaded=true;
    }
    catch(error){
        displayError();
    }
}

function populateFromOptions() {

    currencies.forEach((currency) => {
            const fromOption = document.createElement('div');
            fromOption.dataset.value=currency.code;
            fromOption.classList.add('option');
            const fromImgEle=document.createElement('img');
            fromImgEle.setAttribute('src',currency.flag);
            fromImgEle.classList.add('flag-image');
            const fromSpanEle=document.createElement('span');
            fromSpanEle.textContent=`${currency.code} ${currency.name}`;
            fromSpanEle.classList.add('currency-code');
            fromOption.appendChild(fromImgEle);
            fromOption.appendChild(fromSpanEle);
            fromOption.addEventListener('click',(event) => {
                const option=event.currentTarget;
                const image=option.querySelector('.flag-image').src;
                const currency=option.querySelector('.currency-code').textContent;
                selectedFromOption.querySelector('.flag-image').src=image;
                selectedFromOption.querySelector('.currency-code').textContent=currency;
                selectedFromOption.dataset.value=option.dataset.value;
                fromOptions.style.display='none';
            });
            fromOptions.appendChild(fromOption);
    });
}

function populateToOptions(){

    currencies.forEach((currency) => {

            const toOption = document.createElement('div');
            toOption.dataset.value=currency.code;
            toOption.classList.add('option');
            const toImgEle=document.createElement('img');
            toImgEle.setAttribute('src',currency.flag);
            toImgEle.classList.add('flag-image');
            const toSpanEle=document.createElement('span');
            toSpanEle.textContent=`${currency.code} ${currency.name}`;
            toSpanEle.classList.add('currency-code');
            toOption.appendChild(toImgEle);
            toOption.appendChild(toSpanEle);
            toOption.addEventListener('click',(event) => {
                const option=event.currentTarget;
                const image=option.querySelector('.flag-image').src;
                const currency=option.querySelector('.currency-code').textContent;
                selectedToOption.querySelector('.flag-image').src=image;
                selectedToOption.querySelector('.currency-code').textContent=currency;
                selectedToOption.dataset.value=option.dataset.value;
                toOptions.style.display='none';
            });
            toOptions.appendChild(toOption);
    });
}

const convertCurrency= async (event) => {
    try{
        event.preventDefault();

        disableConvertButton();

        const amount=Number(amountInput.value);
        if(isNaN(amount) || amount<=0){
            alert("Please enter a valid amount");
            return;
        }
        const fromCurrency=selectedFromOption.dataset.value;
        const toCurrency=selectedToOption.dataset.value;
        if(fromCurrency==="" || toCurrency===""){
            alert("Please select both currencies");
            return;
        }
        const response=await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATES_API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`);
        if(!response.ok){
            displayError();
            return;
        }
        const data=await response.json();
        const convertedAmount=data.conversion_result;
        resultMessage.textContent=`${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        displayResult();
    }
    catch(error){
        displayError();
    }
}

converterForm.addEventListener('submit',convertCurrency);

fetchCountries();