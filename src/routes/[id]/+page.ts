import { error } from "@sveltejs/kit";
import { characters } from "$lib/data/characters";

// Unknown ids (including /sitemap.xml) get a proper 404 instead of a render crash.
export function load({ params }) {
	if (!characters.some((c) => c.id === params.id)) error(404, "Character not found");
}
