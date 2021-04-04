const tempElement = document.querySelector("#temperature");

let polling = false;
const fetchTemp = () => {
  polling = true;
  return fetch("/temperatures/latest")
    .then((response) => {
      if (response.ok) return response.json();
      else throw new Error("could not fetch");
    })
    .then(({ temperature, date }) => {
      if (temperature) tempElement.textContent = `${temperature}°C`;
      else tempElement.textContent = `Offline`;
      return !!temperature;
    })
    .catch((error) => {
      console.error(error);
      tempElement.textContent = `Erro na requisição`;
      return false;
    })
    .finally(() => {
      polling = false;
    });
};

const NORMAL_POLL = 6 * 60 * 1000;
const ERROR_POLL = 1 * 60 * 1000;
const pollTemperature = () => {
  if (!polling)
    fetchTemp().then((success) => {
      setTimeout(pollTemperature, success ? NORMAL_POLL : ERROR_POLL);
    });
};

pollTemperature();
