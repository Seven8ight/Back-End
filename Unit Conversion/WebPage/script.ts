const convertForm = document.querySelector<HTMLFormElement>("#conversion");

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
type ResponseResult = {
  Initial: number;
  InitialUnit: units;
  Result: number;
  Unit: units;
  Converted: boolean;
};

if (convertForm) {
  convertForm?.addEventListener("submit", async (event: SubmitEvent) =>
    new Promise(async (resolve, reject) => {
      try {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);

        if (Number.isNaN(Number.parseInt(formData.get("unit") as string))) {
          const error = document.createElement("p");

          error.id = "iInput";
          error.innerHTML = "Enter a numerical value for conversion";

          document.body.append(error);

          setTimeout(() => {
            document.body.removeChild(error);
          }, 2000);

          return;
        }

        await fetch("http://localhost:3000/convert", {
          method: "POST",
          body: JSON.stringify({
            unit: formData.get("unit"),
            from: formData.get("from"),
            to: formData.get("to"),
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    })
      .then((response) => {
        const results: ResponseResult = response as ResponseResult,
          resultDiv = document.querySelector<HTMLDivElement>("#result"),
          resultParagraph: HTMLParagraphElement = document.createElement("p");

        if (resultDiv) {
          console.log(results);
          if (Number.isInteger(results.Result) && results.Unit) {
            resultParagraph.innerText =
              results.Converted == true
                ? `${results.Initial} ${results.InitialUnit} = ${
                    results.Result
                  } ${results.Unit}${
                    results.Result > 1 &&
                    results.Unit != "Celcius" &&
                    results.Unit != "Farenheit"
                      ? "s"
                      : ""
                  }`
                : `Invalid conversion of ${results.InitialUnit} to ${results.Unit}`;

            resultDiv.appendChild(resultParagraph);
          }
        }
      })
      .catch((error) => console.log(error))
  );
} else {
  console.error("Enable javascript to use this website");
}
