# Pax-o-dex? SiteSync? (name tbd)

This repo houses F3 Omaha's PAX management and scheduling tool. The new tool will provide admins and Site Q's the ability to both add new and search existing PAX.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Further help

Contact Nolan Clark - iMac (nolanmclark@gmail.com) - or anyone from the F3 Tech / Data team for more help installing this application.

## Ideas with legs

### User Account Association -
Allow PAX to claim their account by providing the following:
F3 Name
Email Address or Phone on Account when they signed up.
(this might be frustrating to some users, but we need validation).

If this data matches what we have in the database, ask the user to create a password for their account.
Register the new user account in Firestore, associate the account to the user data.

Users can then update or delete their F3 data we have on file.

