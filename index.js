const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const chalk = require('chalk');

class DotaAutoexecGenerator {
  constructor() {
    this.settings = {
      essentials: {
        "con_enable": { 
          name: "Enable Console", 
          desc: "Enter 0 to disable", 
          default: "1" 
        },
        "dota_minimap_misclick_time": { 
          name: "Minimap Misclick Threshold", 
          desc: "Set to 0 to ensure 100% minimap responsiveness.", 
          default: "0" 
        },
        "engine_no_focus_sleep": { 
          name: "No Sleep When Out of Focus", 
          desc: "Run full FPS while tabbed out. Essential for streaming.", 
          default: "1" 
        },
        "dota_camera_disable_zoom": { 
          name: "Disable Camera Zoom", 
          desc: "Prevents accidental zoom during crucial moments such as teamfights or laning.", 
          default: "1" 
        }
      },
      minimap: {
        "dota_minimap_creep_scale": { 
          name: "Minimap Creep Scale", 
          desc: "Increase for easier creepwave tracking (optional).", 
          default: "1" 
        },
        "dota_minimap_hero_size": { 
          name: "Minimap Hero Icon Size", 
          desc: "Adjusts hero icon size on minimap.", 
          default: "800" 
        },
        "dota_minimap_ping_duration": { 
          name: "Minimap Ping Duration", 
          desc: "How long pings remain visible on the minimap.", 
          default: "3" 
        }
      },
      healthbar: {
        "dota_health_hurt_decay_time_max": { name: "HP Bar Change Delay Max", desc: "Maximum delay for HP bar change animations.", default: "0" },
        "dota_health_hurt_decay_time_min": { name: "HP Bar Change Delay Min", desc: "Minimum delay for HP bar change animations.", default: "0" },
        "dota_health_hurt_delay": { name: "HP Bar Delay", desc: "General HP bar update delay.", default: "0" },
        "dota_pain_decay": { name: "HP Pain Decay", desc: "Decay rate for HP loss indicators.", default: "0" },
        "dota_pain_factor": { name: "HP Pain Factor", desc: "Factor influencing HP loss animation speed.", default: "0" },
        "dota_pain_multiplier": { name: "HP Pain Multiplier", desc: "Multiplier for HP damage flash effect.", default: "0" },
        
        "dota_hud_healthbar_number": { name: "Show HP Number", desc: "Display exact HP number above health bar.", default: "1" },

        "dota_health_marker_major_alpha": { name: "Major HP Divider Opacity", desc: "Opacity for major health dividers.", default: "255" },
        "dota_health_marker_minor_alpha": { name: "Minor HP Divider Opacity", desc: "Opacity for minor health dividers.", default: "128" },
        "dota_health_per_vertical_marker": { name: "Health Segment Spacing", desc: "Spacing between vertical HP markers.", default: "200" }
      }
    };    

    this.binds = [
      'bind "ctrl" "+dota_unit_movetodirection"',
      'bind "f7" disconnect'
    ];
  }

  getDotaCfgPath() {
    const platform = os.platform();
    let possiblePaths = [];

    if (platform === 'win32') {
      const programFiles86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
      const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
      
      possiblePaths = [
        path.join(programFiles86, 'Steam', 'steamapps', 'common', 'dota 2 beta', 'game', 'dota', 'cfg'),
        path.join(programFiles, 'Steam', 'steamapps', 'common', 'dota 2 beta', 'game', 'dota', 'cfg'),
        'C:\\Program Files\\Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg',
        'D:\\Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg',
        'E:\\Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg'
      ];
    } else if (platform === 'darwin') {
      possiblePaths = [
        path.join(os.homedir(), 'Library', 'Application Support', 'Steam', 'steamapps', 'common', 'dota 2 beta', 'game', 'dota', 'cfg')
      ];
    } else if (platform === 'linux') {
      possiblePaths = [
        path.join(os.homedir(), '.steam', 'steam', 'steamapps', 'common', 'dota 2 beta', 'game', 'dota', 'cfg'),
        path.join(os.homedir(), '.local', 'share', 'Steam', 'steamapps', 'common', 'dota 2 beta', 'game', 'dota', 'cfg')
      ];
    }

    return possiblePaths;
  }

  async findDotaInstallation() {
    const possiblePaths = this.getDotaCfgPath();
    
    for (const cfgPath of possiblePaths) {
      const dotaPath = path.dirname(cfgPath);
      try {
        await fs.access(dotaPath);
        console.log(chalk.green(`✓ Found Dota 2 installation: ${dotaPath}`));
        return cfgPath;
      } catch (error) {
        // Path doesn't exist, continue searching
      }
    }

    return null;
  }

  async getConfigValues() {
    const questions = [];
  
    for (const [category, settings] of Object.entries(this.settings)) {
      for (const [cmd, { name, desc, default: defaultVal }] of Object.entries(settings)) {
        questions.push({
          type: 'input',
          name: cmd,
          message: `${chalk.green(name)}: ${desc}`,
          default: defaultVal
        });
      }
    }
  
    const answers = await inquirer.prompt(questions);
    return answers;
  }
  

  generateConfig(configValues) {
    const lines = [];
    
    lines.push('// Generated by dota2-autoexec-generator');
    lines.push('// https://github.com/rossi2nico/dota2-autoexec-generator\n');
    
    lines.push('// Settings');
    for (const [cmd, value] of Object.entries(configValues)) {
      lines.push(`${cmd} "${value}"`);
    }
    
    lines.push('');
    lines.push('// Keybinds');
    lines.push(...this.binds);
    
    return lines.join('\n');
  }

  async run() {
    console.log(chalk.cyan.bold('Dota 2 Autoexec Generator'));
    console.log(chalk.gray('Professional autoexec settings the easy way\n'))

    let cfgPath = await this.findDotaInstallation();
  
    if (!cfgPath) {
      console.log(chalk.yellow('Could not auto-detect Dota 2 installation.'));
      
      const { customPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customPath',
          message: 'Enter your Dota 2 cfg directory path (or press Enter to save in current directory):\n',
          default: path.join(process.cwd(), 'cfg')
        }
      ]);
      
      cfgPath = customPath;
    }

    // console.log(chalk.blue('\nConfigure your settings:'));
    const configValues = await this.getConfigValues();
    const configContent = this.generateConfig(configValues);

    try {
      await fs.mkdir(cfgPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${cfgPath}`);
    }

    
    const configFile = path.join(cfgPath, 'autoexec.cfg');
    const backupFile = path.join(cfgPath, 'old-autoexec.cfg');

    try {

      await fs.access(configFile);
      await fs.rename(configFile, backupFile);
      console.log(chalk.yellow(`\nExisting autoexec.cfg renamed to old-autoexec.cfg`));
    } catch {

    }
    await fs.writeFile(configFile, configContent);

    console.log(chalk.green('✓ autoexec.cfg generated successfully!'));
    console.log(chalk.gray(`📁 Location: ${configFile}`));
    console.log(chalk.gray(`📄 Size: ${configContent.length} bytes`));
    console.log(chalk.gray("github.com/rossi2nico/dota2-autoexec-generator"))
  }
}

module.exports = { DotaAutoexecGenerator };

if (require.main === module) {
  const generator = new DotaAutoexecGenerator();
  generator.run().catch(console.error);
}
