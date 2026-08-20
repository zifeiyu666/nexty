// https://fonts.google.com/

import { Bangers, Bricolage_Grotesque, Carter_One, Karla, Pacifico } from 'next/font/google'

export const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const carterOne = Carter_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
})

export const pacifico = Pacifico({
  weight: "400",
  display: "swap",
  preload: false,
})

export const karla = Karla({
  subsets: ['latin'],
  display: 'swap',
})