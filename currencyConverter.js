const REST_COUNTRIES_API_KEY='rc_live_538467c321d7464989321ffd45d340cb';
const EXCHANGE_RATES_API_KEY='3e081a00f3cfc4b074079384';

const restCountriesUrl=`https://api.restcountries.com/countries/v5?response_fields=names.common,names.native,names.official,currencies,flag.emoji&limit=100&offset=0&api-key=${REST_COUNTRIES_API_KEY}`;

const resultMessage = document.getElementById('result-message');
const errorMessage = document.getElementById('error-message');
const fromDropdown = document.getElementById('from-dropdown');
const toDropdown = document.getElementById('to-dropdown');
const amountInput = document.getElementById('input-amount');
const converterForm = document.getElementById('currency-converter-form');

let currencies = [];

const displayResult=() =>{
        resultMessage.classList.remove('hidden');
        setTimeout(() => {
                resultMessage.classList.add('hidden');
        },5000);
}
const displayError=() =>{
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
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
                                flag: country.flag.emoji
                        });
                });
        });
        currencies.sort((a,b) => {
                if(a.code < b.code) return -1;
                if(a.code > b.code) return 1;
                return 0;
        });
        populateDropdowns();
    }
    catch(error){
        displayError();
    }
}

function populateDropdowns() {

    fromDropdown.innerHTML=`<option value="">
                                Select a Currency
                            </option>`;
    toDropdown.innerHTML=`<option value="">
                                Select a Currency
                        </option>`;

    currencies.forEach((currency) => {
            const fromOption = document.createElement('option');
            fromOption.value=currency.code;
            fromOption.textContent=`${currency.flag} ${currency.code} - ${currency.name}`;
            fromDropdown.appendChild(fromOption);

            const toOption = document.createElement('option');
            toOption.value=currency.code;
            toOption.textContent=`${currency.flag} ${currency.code} - ${currency.name}`;
            toDropdown.appendChild(toOption); 
    });
}

const convertCurrency= async (event) => {
    try{
        event.preventDefault();
        const amount=Number(amountInput.value);
        if(isNaN(amount) || amount<=0){
            alert("Please enter a valid amount");
            return;
        }
        if(fromDropdown.value==="" || toDropdown.value===""){
            alert("Please select both currencies");
            return;
        }
        const response=await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATES_API_KEY}/pair/${fromDropdown.value}/${toDropdown.value}/${amount}`);
        if(!response.ok){
            displayError();
            return;
        }
        const data=await response.json();
        const convertedAmount=data.conversion_result;
        resultMessage.textContent=`${amount} ${fromDropdown.value} = ${convertedAmount.toFixed(2)} ${toDropdown.value}`;
        displayResult();
    }
    catch(error){
        displayError();
    }
}

converterForm.addEventListener('submit',convertCurrency);

fetchCountries();