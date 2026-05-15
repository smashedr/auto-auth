# New Issue - Agent Guide

## UI

All UI elements can be accessed via a Keyboard Shortcut (if configured) and the Right-Click context menu (if enabled).

The extension options allow setting a custom background Picture or Video URL that shows on the Options and Auth Page.

### Auth Page (webRequest.onAuthRequired)

The Auth page, shown when auth is required allowing the user to enter their username and password.

Allows saving the credentials, entering them without saving, or ignoring the host permanently.

Includes an Offscreen Options page accessible from an icon in the bottom left corner of the screen.

### Options Page

Shows keyboard shortcuts, extension options, import/export, credentials table.
Has link to home page, support page, and to copy support information.

### Popup

Shows extension options, allows viewing/editing credentials for the active tab, if any.

### Side Panel

Shows extension options, import/export, credentials table.

### Popout (Extension Panel)

Shows extension options, import/export, credentials table.

## Components

- Context Menu: openPopup, openSidePanel, openExtPanel, openOptions
- Keyboard Shortcuts: openPopup, openSidePanel, openExtPanel, openOptions

### Credentials Table

Can be configured to show/hide the username/password columns, show/hide the username/password values,
enable click to edit (where clicking on a field makes it editable) or show large table rows.

The hosts column is always visible, there is a delete button on the left and an edit button on the right.

Hosts can also be exported or imported from file or text. The import can come from other extensions including:

[krtek4/MultiPass](https://github.com/krtek4/MultiPass)
[steffanschlein/AutoAuth](https://github.com/steffanschlein/AutoAuth)
[Basic Authentication](https://chromewebstore.google.com/detail/nanfgbiblbcagfodkfeinbbhijihckml)

Instructions to do this are on the GitHub README.

## Additional Notes

- Permissions: `contextMenus, storage, webRequest, webRequestAuthProvider`
- Host Perms: `*://*/*`
