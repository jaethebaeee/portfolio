import React from 'react';
import { ZONE_POSITIONS } from './constants/portfolioConstants';

import { AboutZone } from './zones/AboutZone';
import { SkillsZone } from './zones/SkillsZone';
import { EducationZone } from './zones/EducationZone';
import { ProjectsZone } from './zones/ProjectsZone';
import { ContactZone } from './zones/ContactZone';
import { GamesZone } from './zones/GamesZone';

/**
 * Layout component that positions all portfolio zones in the 3D scene
 */
export const ZonesLayout = React.memo(function ZonesLayout() {

  return (
    <>

      {/* About Zone */}
      <group position={ZONE_POSITIONS.ABOUT}>
        <AboutZone />
      </group>

      {/* Skills Zone */}
      <group position={ZONE_POSITIONS.SKILLS}>
        <SkillsZone />
      </group>

      {/* Education Zone */}
      <group position={ZONE_POSITIONS.EDUCATION}>
        <EducationZone />
      </group>

      {/* Projects Zone */}
      <group position={ZONE_POSITIONS.PROJECTS}>
        <ProjectsZone />
      </group>

      {/* Contact Zone */}
      <group position={ZONE_POSITIONS.CONTACT}>
        <ContactZone />
      </group>

      {/* Games Zone */}
      <group position={ZONE_POSITIONS.GAMES}>
        <GamesZone />
      </group>
    </>
  );
});
