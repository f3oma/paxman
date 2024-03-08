# PaxNet & PaxMan

This repo houses F3 Omaha's PAX management and scheduling tool. The new tool will provide admins and Site Q's the ability to both add new and search existing PAX.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Further help

Contact Nolan Clark - iMac (nolanmclark@gmail.com) - or anyone from the F3 Tech / Data team for more help installing this application.

## Notes
As an unauthenticated user I can:
- View basic pax details (name + f3 name) but cannot contact anyone
- Create an account

As an authenticated user I can:
- Everything above, plus:
- Add a PAX
- Search & Contact PAX with their contact info
- Claim my PAX info and edit my own information
- View basic AO list

As a Site-Q I can:
- Everything above, plus:
- Manage my site data & details

As an Admin I can:
- Everything above, plus:
- Manage all site data
- Manage all PAX data



## Ideas with legs

### User Account Association
✅ Allow PAX to claim their account data  
✅ Allow PAX to update their F3 data we have on file  
Allow PAX to delete their F3 data  

### CRUD AO Data
Add hidden view with Site-Q's and Admin level access to AO Data
Allow Site-Q's and Admins to add new AO's to the database  
Associate all account "Initial AO" locations to the new database AOs  

### TODO
- Create a cloud function to add an additional 1 row for every week 3 months ahead
  - Probably can just run a scheduled action every week on sundays
  - Need to come up with a flag for weekly AOs
  
