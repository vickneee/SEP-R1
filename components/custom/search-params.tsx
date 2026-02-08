import { parseAsString, createLoader } from "nuqs/server";

// Define the search parameters for coordinates.
// Here we describe the query parameters and provide default values.
// This configuration can be reused in useQueryStates or createSerializer.
export const coordinatesSearchParams = {
  // "search" parameter: parsed as a string, defaults to an empty string if not provided
  search: parseAsString.withDefault(""),
};
// Create a loader function based on the defined search parameters.
// This loader can be used to easily read and manage query parameters in server-side code.
export const loadSearchParams = createLoader(coordinatesSearchParams);
