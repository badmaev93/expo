import { register } from '../core/registry'

import chart       from './ChartWidget'
import metric      from './MetricWidget'
import gauge       from './GaugeWidget'
import video       from './VideoWidget'
import text        from './TextWidget'
import clock       from './ClockWidget'
import image       from './ImageWidget'
import hero        from './HeroWidget'
import activitylog from './ActivityLogWidget'
import environment from './EnvironmentWidget'
import statuscard  from './StatusCardWidget'
import network     from './NetworkTopologyWidget'
import radialgauge from './RadialGaugeWidget'
import heatmap     from './HeatmapWidget'
import projectcard from './ProjectCardWidget'
import markettrend from './MarketTrendWidget'
import link        from './LinkWidget'

let done = false
export function registerBuiltins() {
  if (done) return
  ;[hero, heatmap, text, metric, gauge, chart, video, image, clock,
    activitylog, environment, statuscard, network, radialgauge,
    projectcard, markettrend, link
  ].forEach(register)
  done = true
}
