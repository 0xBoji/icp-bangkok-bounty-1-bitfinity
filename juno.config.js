import {defineConfig} from '@junobuild/config';

/** @type {import('@junobuild/config').JunoConfig} */
export default defineConfig({
  satellite: {
    id: '6cgrm-vyaaa-aaaal-amtha-cai',
    source: 'build',
    predeploy: ['npm run build']
  }
});
