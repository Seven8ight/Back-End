var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var searchBtn = document.querySelector("#searcher"), errorContainer = document.querySelector("#error"), errorTag = document.querySelector("#error p"), noInfoContainer = document.querySelector("#no-info"), weatherContainer = document.querySelector("#container"), weatherCard = document.querySelector("#weather-card-info"), placeInput = document.querySelector("#place"), weatherImg = document.querySelector("#image img"), countryTag = document.querySelector("#country p"), cityTag = document.querySelector("#country h1"), tempTag = document.querySelector("#temp span:last-of-type"), humidityTag = document.querySelector("#humidity p span"), precipitationTag = document.querySelector("#precipitation p span"), pressureTag = document.querySelector("#pressure p span"), visibilityTag = document.querySelector("#visibility p span"), weatherInfoChecker = function (arg) {
    return arg.resolvedAddress !== undefined &&
        arg.conditions !== undefined &&
        arg.humidity !== undefined &&
        arg.visibility !== undefined &&
        arg.temp !== undefined &&
        arg.pressure !== undefined &&
        arg.precip !== undefined;
};
if (searchBtn instanceof HTMLButtonElement &&
    noInfoContainer instanceof HTMLDivElement &&
    placeInput instanceof HTMLInputElement &&
    errorContainer instanceof HTMLDivElement &&
    weatherCard instanceof HTMLDivElement &&
    errorTag)
    searchBtn.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
        var weatherRequest, weatherResponse, addressLocation, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    noInfoContainer.classList.add("disappear");
                    weatherCard.classList.add("appear");
                    if (errorContainer.classList.contains("error"))
                        errorContainer.classList.remove("error");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    if (!(placeInput.value.length > 0 && weatherContainer)) return [3 /*break*/, 7];
                    weatherContainer.classList.add("loading");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch("/weather", {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json",
                            },
                            body: JSON.stringify({
                                Place: placeInput.value,
                            }),
                        })];
                case 3:
                    weatherRequest = _a.sent();
                    return [4 /*yield*/, weatherRequest.json()];
                case 4:
                    weatherResponse = _a.sent();
                    if (weatherRequest.status == 200) {
                        if (weatherImg &&
                            countryTag &&
                            cityTag &&
                            tempTag &&
                            humidityTag &&
                            precipitationTag &&
                            pressureTag &&
                            visibilityTag) {
                            if (weatherResponse.conditions == "Partially cloudy")
                                weatherImg.src = "/Images/Sunny-cloudy.png";
                            else if (weatherResponse.conditions.toLowerCase().includes("rain") &&
                                weatherResponse.conditions.toLowerCase().includes("cloud"))
                                weatherImg.src = "/Images/Rain-Cloudy.png";
                            else if (weatherResponse.conditions.toLowerCase().includes("cloud"))
                                weatherImg.src = "/Images/Cloudy.png";
                            else if (weatherResponse.conditions.toLowerCase().includes("sun"))
                                weatherImg.src = "/Images/Sunny.png";
                            else if (weatherResponse.conditions.toLowerCase().includes("wind"))
                                weatherImg.src = "/Images/Windy.png";
                            else if (weatherResponse.conditions.toLowerCase().includes("snow"))
                                weatherImg.src = "/Images/Snow.png";
                            else
                                weatherImg.src = "/Images/Rainy.png";
                            addressLocation = weatherResponse.resolvedAddress.split(",");
                            cityTag.innerHTML = addressLocation[0];
                            countryTag.innerHTML =
                                addressLocation[addressLocation.length - 1];
                            tempTag.innerHTML = "".concat(weatherResponse.temp, "<sup>\u02DA</sup>C");
                            humidityTag.innerHTML = "".concat(weatherResponse.humidity, " <span>g/kg</span>");
                            precipitationTag.innerHTML = "".concat(weatherResponse.precip, " <span>L/m<sup>2</sup></span>");
                            pressureTag.innerHTML = "".concat(weatherResponse.pressure, " <span>N/m<sup>2</sup></span>");
                            visibilityTag.innerHTML = "".concat(weatherResponse.visibility, " <span>Km</span>");
                        }
                    }
                    if (!weatherRequest.ok) {
                        errorContainer.classList.add("error");
                        weatherCard.classList.remove("appear");
                        if (weatherResponse.Error &&
                            weatherResponse.Error.includes("getaddrinfo"))
                            errorTag.innerHTML = "Network request failed, please try again";
                        else if (weatherRequest.status == 404) {
                            errorTag.innerHTML = "City / state not found";
                            setTimeout(function () {
                                errorContainer.classList.remove("error");
                                noInfoContainer.classList.add("appear");
                            }, 2000);
                        }
                        else if (weatherResponse.Error &&
                            weatherResponse.Error.toLowerCase().includes("timedout"))
                            errorTag.innerHTML =
                                "Network request timed out, please try again";
                        else
                            errorTag.innerHTML =
                                weatherResponse.Error || weatherResponse.message;
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    errorTag.innerHTML = error_1.message;
                    errorContainer.classList.add("error");
                    weatherCard.classList.remove("appear");
                    return [3 /*break*/, 6];
                case 6:
                    placeInput.value = "";
                    weatherContainer.classList.remove("loading");
                    return [3 /*break*/, 8];
                case 7:
                    placeInput.placeholder = "Enter a value first";
                    setTimeout(function () {
                        placeInput.placeholder = "State/City";
                    }, 2000);
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    errorTag.innerHTML = error_2.message;
                    errorContainer.classList.add("error");
                    weatherCard.classList.remove("appear");
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
