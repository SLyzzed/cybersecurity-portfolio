import { ludusInfrastructure } from "../config/research-sections";
import { getEntryUrl, getPublishedEntries, sitePath } from "./content";

export async function getInfrastructureLinks() {
  const entries = await getPublishedEntries("infrastructure");
  const links = new Map(entries.map(({ id, data }) => [
    id, { title: data.title, href: getEntryUrl("infrastructure", id) }
  ]));

  const { id, title, href } = ludusInfrastructure;
  if (links.has(id)) {
    throw new Error(`Infrastructure ID "${id}" is reserved for the existing Ludus Cyber Range page.`);
  }
  links.set(id, { title, href: sitePath(href) });
  return links;
}
