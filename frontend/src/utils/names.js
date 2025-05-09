import petrovich from "petrovich";
export default function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/); // Удаляет лишние пробелы и разделяет по пробелам

  const [lastName = "", firstName = "", patronymic = ""] = parts;

  return {
    lastName,
    firstName,
    patronymic,
  };
}

export function toGenitive(fullName, gender = "male") {
  const Petrovich = petrovich;

  const [lastName, firstName, middleName] = fullName.trim().split(" ");

  var person = {
    first: firstName,
    middle: middleName,
    last: lastName,
  };

  const { first, middle, last } = petrovich(person, "genitive");

  return `${last} ${first} ${middle}`;
}
