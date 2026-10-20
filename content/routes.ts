type ContentRouteKind =
  | "navigation"
  | "section"
  | "service"
  | "course"
  | "collection"
  | "portfolio-case"

export type ContentRoute = {
  id: string
  kind: ContentRouteKind
  path: string
  href: string
  label: string
}

export function servicePath(routeSegment: string) {
  return `/services/${routeSegment}`
}

export function sectionPath(routeSegment: string) {
  return `/${routeSegment}`
}

export function coursePath(routeSegment: string) {
  return `/courses/${routeSegment}`
}

export function collectionPath(routeSegment: string) {
  return `/collections/${routeSegment}`
}

export function portfolioCasePath(routeSegment: string) {
  return `/portfolio/${routeSegment}`
}
