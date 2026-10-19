import { ScrollViewStyleReset } from "expo-router/html"
import { type PropsWithChildren } from "react"
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Finmori Pocket — Personal Finance Demo</title>
        <meta
          name="description"
          content="Interactive portfolio adaptation of the open-source Finmori UI kit: transactions, budgets and savings goals."
        />
        <meta name="theme-color" content="#293056" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  )
}
