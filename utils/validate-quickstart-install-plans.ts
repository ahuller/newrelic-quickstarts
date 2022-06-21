import {
  fetchPaginatedGHResults,
  filterQuickstartConfigFiles,
  filterOutTestFiles,
  GithubAPIPullRequestFile
} from './lib/github-api-helpers';

import Quickstart from './lib/Quickstart';
import InstallPlan from './lib/InstallPlan';
import { InstallPlanConfig } from './types/InstallPlanConfig';
import { QuickstartConfig } from './types/QuickstartConfig';
import { prop, passedProcessArguments } from './lib/helpers';


/**
 * Gets all install plan ids under `installs/` dir
 * @returns - An array of install plan Ids
 */
export const getAllInstallPlanIds = () => {
  return InstallPlan.getAll().reduce<InstallPlanConfig["id"][]>(
    (acc, installPlan) => {
      const { id } = installPlan.config;

      return [...new Set([...acc, id])];
    },
    []
  );
};

/**
 * Main validation logic ensuring install plans specified in config files actually exist
 */
export const validateInstallPlanIds = (githubFiles: GithubAPIPullRequestFile[]) => {
  const configFiles: GithubAPIPullRequestFile[] = filterQuickstartConfigFiles(githubFiles);
  const existingConfigFiles: GithubAPIPullRequestFile[] = configFiles.filter(
    (cf: GithubAPIPullRequestFile) => cf.status !== 'removed'
  ); // Filter out deleted files

  const quickstarts = existingConfigFiles.map(
    ({ filename }) => new Quickstart(filename)
  );

  // get all components associated with quickstart
  
  const installPlanNoMatches = quickstarts.flatMap(quickstart => {
    // TODO: filter out any valid quickstarts so we only work with invalid quickstarts
  })
  // validate against install plan
  // add any invalid install plans to array

  //   const invalidQuickstarts= quickstart
  //     .validate()
  //     .getComponents()
  //     .filter((component) => component instanceof InstallPlan)
  //     .filter(component => !component.isValid)
  // })
  

  if (installPlanNoMatches.length > 0) {
    console.error(
      `ERROR: Found install plans with no corresponding install plan id.\n`
    );
    console.error(`An install plan id must match an existing install plan id.`);
    installPlanNoMatches.forEach((m) =>
      console.error(`- ${m.installPlanIds!.join(', ')} in ${m.configPath}`)
    );
    console.error(
      `\nPlease change to an existing install plan id or remove the ids.`
    );

    if (require.main === module) {
      process.exit(1);
    }
  }
};

const main = async () => {
  const [ GITHUB_API_URL ] = passedProcessArguments();
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('GITHUB_TOKEN is not defined.');
    process.exit(1);
  }
  const files = await fetchPaginatedGHResults(
    GITHUB_API_URL,
    githubToken
  );
  validateInstallPlanIds(filterOutTestFiles(files));
};

if (require.main === module) {
  main();
}
