# Finmori Pocket

Source adaptation of https://github.com/KhoaSuperman/Finmori-ReactNativeWeb (MIT; retain LICENSE).
Original Finmori design credited by upstream to Zoey Do. Reference: https://finmori-uikits.vercel.app/
Daily UI is a separate free prompt service, not the source of this design or code.

## Working app

Run `npm ci --ignore-scripts`, then `npm run web`. Open `/pocket`.
The upstream component showcase and screen templates remain available; `/pocket` is the new connected application.

The completed web export is in dist/. Run `npm run preview:pocket` to serve it at http://localhost:8081/pocket. Stop any existing server on port 8081 before restarting. `npm run typecheck:app` checks the app separately from upstream Storybook samples.

Features: income/expense creation, validated dates and exact-cent amounts, searchable/filterable history, calculated balance and monthly budget, category analytics, savings goals/contributions, profile and budget preferences. Original kit BalanceCard, BottomNavBar, category icons and header artwork are reused. Goals are separate progress records, not financial transfers.

Browser persistence uses localStorage. Native iOS/Android previews currently retain changes only during the session; native durable storage is future work. Browser records are local, unencrypted and not backed up. Sample clients, amounts and records are fictional. No banking integration, cloud sync or real payment flow is included.

## Portfolio wording

“Adapted the open-source Finmori UI kit into an interactive personal finance demo, adding shared transaction state, browser persistence, analytics and goal workflows.”

Credit the UI kit and designer. Do not present the original design as your own or describe this demo as a production banking app. Publish only after verification.
