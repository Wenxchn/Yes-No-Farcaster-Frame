import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { kv } from '@vercel/kv'

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {
  const { buttonValue, status } = c
  const choice = buttonValue
  let yesCount = 0
  let noCount = 0

  if (choice) {
    if (choice === 'yes') {
      yesCount = (await kv.get('yes')) ?? 0
      yesCount = yesCount + 1
      await kv.set('yes', yesCount)
      noCount = (await kv.get('no')) ?? 0
    } else if (choice === 'no') {
      noCount = (await kv.get('no')) ?? 0
      noCount = noCount + 1
      await kv.set('no', noCount)
      yesCount = (await kv.get('yes')) ?? 0
    } else {
      noCount = (await kv.get('no')) ?? 0
      yesCount = (await kv.get('yes')) ?? 0
    }
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:
            status === 'response'
              ? 'linear-gradient(to right, #432889, #17101F)'
              : 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 40,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {status === 'response' && choice !== 'viewPositions'
            ? `You voted ${choice}.`
            : 'There will be over a 10,000 Kramer predictions before 5/29 midnight'}
          {status === 'response' && choice === 'viewPositions' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Positions</span>
              <span>{`Yes: ${yesCount}`}</span>
              <span>{`No: ${noCount}`}</span>
            </div>
          )}
        </div>
      </div>
    ),
    intents: [
      status !== 'response' && <Button value="yes">Yes</Button>,
      status !== 'response' && <Button value="no">No</Button>,
      (choice === 'yes' || choice === 'no') && (
        <Button value="viewPositions">View Positions</Button>
      ),
      ,
    ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
