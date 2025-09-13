#!/usr/bin/env node

/**
 * Version management script for FortiFi
 * Usage: node scripts/version.js [patch|minor|major|beta|rc]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packages = [
  'packages/core/package.json',
  'packages/client/package.json',
  'packages/cloud/package.json',
  'examples/demo/package.json',
  'package.json'
];

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return pkg.version;
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null
  };
}

function formatVersion(version) {
  const { major, minor, patch, prerelease } = version;
  let versionStr = `${major}.${minor}.${patch}`;
  if (prerelease) {
    versionStr += `-${prerelease}`;
  }
  return versionStr;
}

function incrementVersion(currentVersion, type) {
  const version = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      return {
        major: version.major + 1,
        minor: 0,
        patch: 0,
        prerelease: null
      };
    
    case 'minor':
      return {
        major: version.major,
        minor: version.minor + 1,
        patch: 0,
        prerelease: null
      };
    
    case 'patch':
      return {
        major: version.major,
        minor: version.minor,
        patch: version.patch + 1,
        prerelease: null
      };
    
    case 'beta':
      if (version.prerelease && version.prerelease.startsWith('beta.')) {
        const betaNum = parseInt(version.prerelease.split('.')[1], 10) + 1;
        return {
          ...version,
          prerelease: `beta.${betaNum}`
        };
      } else {
        return {
          ...version,
          prerelease: 'beta.1'
        };
      }
    
    case 'rc':
      if (version.prerelease && version.prerelease.startsWith('rc.')) {
        const rcNum = parseInt(version.prerelease.split('.')[1], 10) + 1;
        return {
          ...version,
          prerelease: `rc.${rcNum}`
        };
      } else {
        return {
          ...version,
          prerelease: 'rc.1'
        };
      }
    
    default:
      throw new Error(`Unknown version type: ${type}`);
  }
}

function updatePackageVersion(packagePath, newVersion) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Updated ${packagePath} to ${newVersion}`);
}

function updateChangelog(newVersion, type) {
  const changelogPath = 'CHANGELOG.md';
  let changelog = fs.readFileSync(changelogPath, 'utf8');
  
  const today = '2025-09-13'; // Current date for consistent versioning
  const newEntry = `## [${newVersion}] - ${today}

### ${type === 'beta' ? 'Added' : 'Changed'}
- ${type === 'beta' ? 'Beta release' : 'Version bump'}

`;
  
  // Insert after the [Unreleased] section
  changelog = changelog.replace(
    /## \[Unreleased\]\n\n### Added\n- FortiFi Editions comparison table\n- Beta versioning system\n- Enterprise feature roadmap\n\n/,
    `## [Unreleased]\n\n### Added\n- FortiFi Editions comparison table\n- Beta versioning system\n- Enterprise feature roadmap\n\n${newEntry}`
  );
  
  fs.writeFileSync(changelogPath, changelog);
  console.log(`Updated CHANGELOG.md with ${newVersion}`);
}

function main() {
  const type = process.argv[2];
  
  if (!type) {
    console.log('Usage: node scripts/version.js [patch|minor|major|beta|rc]');
    console.log('Current version:', getCurrentVersion());
    process.exit(1);
  }
  
  const validTypes = ['patch', 'minor', 'major', 'beta', 'rc'];
  if (!validTypes.includes(type)) {
    console.error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }
  
  const currentVersion = getCurrentVersion();
  const newVersion = formatVersion(incrementVersion(currentVersion, type));
  
  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);
  
  // Update all package.json files
  packages.forEach(packagePath => {
    if (fs.existsSync(packagePath)) {
      updatePackageVersion(packagePath, newVersion);
    }
  });
  
  // Update changelog
  updateChangelog(newVersion, type);
  
  console.log(`\nVersion bumped to ${newVersion}`);
  console.log('\nNext steps:');
  console.log('1. Review changes: git diff');
  console.log('2. Commit changes: git add . && git commit -m "chore: bump version to ' + newVersion + '"');
  console.log('3. Create tag: git tag v' + newVersion);
  console.log('4. Push changes: git push && git push --tags');
}

if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  parseVersion,
  formatVersion,
  incrementVersion
};
