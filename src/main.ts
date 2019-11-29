import { Client, Collection, Role } from "discord.js"

const client = new Client()

type Lang = "de" | "en" | "fr" | "nl"

type RoleIdByLang = Record<Lang, RoleId>

enum RoleId {
  de = "649947563511775233",
  en = "498267969445691400",
  fr = "649947589537693706",
  nl = "649947983088975872",
}

const RoleIdByLang: RoleIdByLang = {
  "de": RoleId.de,
  "en": RoleId.en,
  "fr": RoleId.fr,
  "nl": RoleId.nl,
}

const changeRoleTest = /^!lang (?:de|en|nl|fr)(?: *,(?:de|en|nl|fr) *)*$/

client.on ("ready", () => {
  console.log (`Optolith Bot logged in as "${client .user .tag}"`)
})

client.on ("message", async msg => {
  if (!msg .author .bot) {
    if (changeRoleTest .test (msg.content)) {
      const newLangs = decodeLangs (msg.content)
      const oldLangs = getOldLangs (msg .member .roles)

      const [ids_to_add, ids_to_remove] = getChanges (oldLangs, newLangs)

      console.log(`Change roles for "${msg .author .tag}": Add ${ids_to_add .join (", ")}, remove ${ids_to_remove .join (", ")}`);

      const member_added = ids_to_add.length > 0 ? await msg .member .addRoles (ids_to_add) : msg .member
      ids_to_remove.length > 0 ? await member_added .removeRoles (ids_to_remove) : member_added

      await msg.reply ("Done!")
    }
    else if (msg.content === "!lang help") {
      await msg.reply (help_text)
    }
    else if (/^!lang \w[\w ]+/ .test (msg.content)) {
      await msg.reply (`What is ${msg .content .slice (6)}? o.O`)
    }
  }
})

const help_text =
`Ich weise dir die Sprachen zu, die du auf diesem Server auch sehen möchtest.
Damit das auch funktioniert, musst du "!lang" mit deinen Sprachen, die du möchtest, aufrufen.
Wenn du später deine Sprachen ändern möchtest, gibt den Befehl einfach erneut ein und liste nur die Sprachen auf, die du dann auch sehen möchtest.
Beispiel: "!lang de,en" gibt dir die deutsche und englische Rolle. Rufst du später "!lang de" auf, hast du nur noch die deutsche Rolle.
Verfügbare Sprachen: de, en, fr, nl

I assign to you the languages you want to see on this server.
To do that, you need to call "!lang" with the languages you want.
If you want to change your languages later, you can just reenter the command and only list the languages you want to see after the call.
Example: "!lang de,en" gives you the German and English role. If you call "!lang en" later, you'll only have the English role then.
Available languages: de, en, fr, nl`

client.login (process.env.AUTH_TOKEN)

const decodeLangs = (x: string): RoleId[] =>
  x .slice (6) .split (",") .map (lang => RoleIdByLang [lang .trim () as Lang])

const getOldLangs = (x: Collection<string, Role>): RoleId[] =>
  x .reduce<RoleId[]> (
    (acc, role) => {
      if (Object.values (RoleId) .includes (role .id as RoleId)) {
        return [...acc, role .id]
      }

      return acc
    },
    []
  )

/**
 * Returns: [ids_to_add, ids_to_remove]
 */
const getChanges = (old_ids: RoleId[], new_ids: RoleId[]) => {
  return [
    new_ids .filter (e => !old_ids .includes (e)),
    old_ids .filter (e => !new_ids .includes (e))
  ]
}
