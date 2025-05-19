type WeatherInfo = {
  resolvedAddress: string;
  humidity: number;
  temp: number;
  precip: Number;
  pressure: number;
  conditions: string;
  visibility: number;
};

const searchBtn = document.querySelector<HTMLButtonElement>("#searcher"),
  errorContainer = document.querySelector<HTMLDivElement>("#error"),
  errorTag = document.querySelector<HTMLParagraphElement>("#error p"),
  noInfoContainer = document.querySelector<HTMLDivElement>("#no-info"),
  weatherContainer = document.querySelector<HTMLDivElement>("#container"),
  weatherCard = document.querySelector<HTMLDivElement>("#weather-card-info"),
  placeInput = document.querySelector<HTMLInputElement>("#place"),
  weatherImg = document.querySelector<HTMLImageElement>("#image img"),
  countryTag = document.querySelector<HTMLParagraphElement>("#country p"),
  cityTag = document.querySelector<HTMLHeadElement>("#country h1"),
  tempTag = document.querySelector<HTMLSpanElement>("#temp span:last-of-type"),
  humidityTag = document.querySelector<HTMLSpanElement>("#humidity p span"),
  precipitationTag = document.querySelector<HTMLSpanElement>(
    "#precipitation p span"
  ),
  pressureTag = document.querySelector<HTMLSpanElement>("#pressure p span"),
  visibilityTag = document.querySelector<HTMLSpanElement>("#visibility p span"),
  weatherInfoChecker = (arg: any): arg is WeatherInfo =>
    arg.resolvedAddress !== undefined &&
    arg.conditions !== undefined &&
    arg.humidity !== undefined &&
    arg.visibility !== undefined &&
    arg.temp !== undefined &&
    arg.pressure !== undefined &&
    arg.precip !== undefined;

if (
  searchBtn instanceof HTMLButtonElement &&
  noInfoContainer instanceof HTMLDivElement &&
  placeInput instanceof HTMLInputElement &&
  errorContainer instanceof HTMLDivElement &&
  weatherCard instanceof HTMLDivElement &&
  errorTag
)
  searchBtn.addEventListener("click", async () => {
    noInfoContainer.classList.add("disappear");
    weatherCard.classList.add("appear");

    if (errorContainer.classList.contains("error"))
      errorContainer.classList.remove("error");
    try {
      if (placeInput.value.length > 0 && weatherContainer) {
        weatherContainer.classList.add("loading");
        try {
          let weatherRequest = await fetch("/weather", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                Place: placeInput.value,
              }),
            }),
            weatherResponse: any = await weatherRequest.json();

          if (weatherRequest.status == 200) {
            if (
              weatherImg &&
              countryTag &&
              cityTag &&
              tempTag &&
              humidityTag &&
              precipitationTag &&
              pressureTag &&
              visibilityTag
            ) {
              if (weatherResponse.conditions == "Partially cloudy")
                weatherImg.src = "/Images/Sunny-cloudy.png";
              else if (
                weatherResponse.conditions.toLowerCase().includes("rain") &&
                weatherResponse.conditions.toLowerCase().includes("cloud")
              )
                weatherImg.src = "/Images/Rain-Cloudy.png";
              else if (
                weatherResponse.conditions.toLowerCase().includes("cloud")
              )
                weatherImg.src = "/Images/Cloudy.png";
              else if (weatherResponse.conditions.toLowerCase().includes("sun"))
                weatherImg.src = "/Images/Sunny.png";
              else if (
                weatherResponse.conditions.toLowerCase().includes("wind")
              )
                weatherImg.src = "/Images/Windy.png";
              else if (
                weatherResponse.conditions.toLowerCase().includes("snow")
              )
                weatherImg.src = "/Images/Snow.png";
              else weatherImg.src = "/Images/Rainy.png";

              let addressLocation = weatherResponse.resolvedAddress.split(",");

              cityTag.innerHTML = addressLocation[0];
              countryTag.innerHTML =
                addressLocation[addressLocation.length - 1];
              tempTag.innerHTML = `${weatherResponse.temp}<sup>˚</sup>C`;
              humidityTag.innerHTML = `${weatherResponse.humidity} <span>g/kg</span>`;
              precipitationTag.innerHTML = `${weatherResponse.precip} <span>L/m<sup>2</sup></span>`;
              pressureTag.innerHTML = `${weatherResponse.pressure} <span>N/m<sup>2</sup></span>`;
              visibilityTag.innerHTML = `${weatherResponse.visibility} <span>Km</span>`;
            }
          }

          if (!weatherRequest.ok) {
            errorContainer.classList.add("error");
            weatherCard.classList.remove("appear");

            errorTag.innerHTML = weatherResponse.message;
          }
        } catch (error) {
          errorContainer.classList.add("error");
          weatherCard.classList.remove("appear");
        }
        placeInput.value = "";
        weatherContainer.classList.remove("loading");
      } else console.log("No value is presented");
    } catch (error) {
      console.log(error);
    }
  });
