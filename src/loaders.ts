export function loadJSON(url: string) : Promise<object> {
  return fetch(url).then(res => res.json());
}