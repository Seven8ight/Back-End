type units =
  | "Celcius"
  | "Farenheit"
  | "Kelvin"
  | "Metre"
  | "Centimetre"
  | "Millimetre"
  | "Feet"
  | "Yard"
  | "Kg"
  | "Lb";
type requestBody = {
  unit: number;
  from: units;
  to: units;
};
type responseBody = {
  Initial: number;
  InitialUnit: units;
  Result: number;
  Converted: boolean;
  Unit: units;
};
const input = document.querySelector<HTMLInputElement>("#input"),
  resultP = document.querySelector<HTMLParagraphElement>("#output p"),
  convertForm = document.querySelector<HTMLFormElement>("#conversion-form"),
  fromUnitBtns = document.querySelector<HTMLDivElement>("#units #btns"),
  toUnitBtns = document.querySelector<HTMLDivElement>("#units2 #btns"),
  requestBdy: requestBody = {
    unit: 45,
    from: "Celcius",
    to: "Farenheit",
  },
  highlightBtn = (btnDiv: HTMLDivElement) => {
    if (btnDiv) {
      let selectedBtn: Element | null = null;

      Array.from(btnDiv.children).forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.classList.add("selected");
          selectedBtn = btn;

          let unit = btn.innerHTML[36] + btn.innerHTML[61] + btn.innerHTML[62];

          if (btn.parentElement?.parentElement?.className == "from") {
            switch (unit) {
              case "Cel":
                requestBdy.from = "Celcius";
                break;
              case "Far":
                requestBdy.from = "Farenheit";
                break;
              case "Kel":
                requestBdy.from = "Kelvin";
                break;
              case "Met":
                requestBdy.from = "Metre";
                break;
              case "Cen":
                requestBdy.from = "Centimetre";
                break;
              case "Mil":
                requestBdy.from = "Millimetre";
                break;
              case "Fee":
                requestBdy.from = "Feet";
                break;
              case "Yar":
                requestBdy.from = "Yard";
                break;
              default:
                if (unit[0] == "K") requestBdy.to = "Kg";
                else requestBdy.to = "Lb";
                break;
            }
          } else {
            switch (unit) {
              case "Cel":
                requestBdy.to = "Celcius";
                break;
              case "Far":
                requestBdy.to = "Farenheit";
                break;
              case "Kel":
                requestBdy.to = "Kelvin";
                break;
              case "Met":
                requestBdy.to = "Metre";
                break;
              case "Cen":
                requestBdy.to = "Centimetre";
                break;
              case "Mil":
                requestBdy.to = "Millimetre";
                break;
              case "Fee":
                requestBdy.to = "Feet";
                break;
              case "Yar":
                requestBdy.to = "Yard";
                break;
              default:
                if (unit[0] == "K") requestBdy.to = "Kg";
                else requestBdy.to = "Lb";
                break;
            }
          }

          [...btnDiv.children].forEach((otherBtns) => {
            if (otherBtns != selectedBtn) {
              if (otherBtns.classList.contains("selected"))
                otherBtns.classList.remove("selected");
            }
          });
        });
      });
    }
  };

if (convertForm)
  convertForm.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();

    if (fromUnitBtns && toUnitBtns && input && resultP) {
      Array.from(fromUnitBtns?.children).forEach(() =>
        highlightBtn(fromUnitBtns)
      );
      Array.from(toUnitBtns.children).forEach(() => highlightBtn(toUnitBtns));

      if (Number.isNaN(Number.parseFloat(input.value))) {
        resultP.innerHTML = "Invalid Input entered, enter only numbers";
        resultP.style.fontSize = "15px";

        setTimeout(() => {
          resultP.innerHTML = "Output here";
          resultP.style.fontSize = "30px";
        }, 2000);
      } else {
        requestBdy.unit = Number.parseFloat(input.value);

        await fetch("/convert", {
          method: "POST",
          body: JSON.stringify(requestBdy),
        })
          .then((response) => response.json() as unknown as responseBody)
          .then((results) => {
            console.log(results);
          });
      }
    }
  });
