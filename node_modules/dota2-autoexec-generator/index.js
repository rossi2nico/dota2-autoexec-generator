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
          desc: "Allows access to the developer console.", 
          default: "1",
          valueRange: ["0", "1"]
        },
        "dota_minimap_misclick_time": { 
          name: "Minimap Misclick Threshold", 
          desc: "Prevents misclicks on the minimap; low value ensures precise control.", 
          default: "0",
          valueRange: ["0", "0.8"]
        },
        "engine_no_focus_sleep": { 
          name: "No Sleep When Out of Focus", 
          desc: "Keeps Dota running at full FPS when tabbed out; great for streaming.", 
          default: "1",
          valueRange: ["0", "1"]
        },
        "dota_camera_disable_zoom": { 
          name: "Disable Camera Zoom", 
          desc: "Stops accidental zooming during fights and laning.", 
          default: "1",
          valueRange: ["0", "1"]
        }
      },
    
      subjective: {
        "dota_minimap_creep_scale": { 
          name: "Minimap Creep Scale", 
          desc: "Adjust creep size on the minimap for clearer wave tracking.", 
          default: "1",
          valueRange: ["1", "2"]
        },
        "dota_minimap_hero_size": { 
          name: "Minimap Hero Icon Size", 
          desc: "Set hero icon size on minimap; larger icons improve visibility.", 
          default: "1200",
          valueRange: ["0", "1200"]
        },
        "dota_minimap_ping_duration": { 
          name: "Minimap Ping Duration", 
          desc: "Controls how long pings stay visible on the minimap.", 
          default: "3",
          valueRange: ["1", "5"]
        },
        "dota_hud_healthbar_number": { 
          name: "Show HP Number above health bar", 
          desc: "Displays exact HP numbers above health bars.", 
          default: "1",
          valueRange: ["0", "1"]
        },
        "dota_health_marker_major_alpha": { 
          name: "Major HP Divider Opacity", 
          desc: "Transparency of major health bar markers.", 
          default: "255",
          valueRange: ["0", "255"]
        },
        "dota_health_marker_minor_alpha": { 
          name: "Minor HP Divider Opacity", 
          desc: "Transparency of minor health bar markers.", 
          default: "128",
          valueRange: ["0", "255"]
        },
        "dota_health_per_vertical_marker": { 
          name: "Health Segment Spacing", 
          desc: "Sets spacing between health bar dividers.", 
          default: "200",
          valueRange: ["50", "500"]
        }
      },
    
      healthbar: {
        "dota_health_hurt_decay_time_max": { 
          name: "HP Bar Change Delay Max", 
          desc: "Max time for HP bar updates to show damage/healing.", 
          default: "0",
          valueRange: ["0", "10"]
        },
        "dota_health_hurt_decay_time_min": { 
          name: "HP Bar Change Delay Min", 
          desc: "Min time for HP bar updates to show changes.", 
          default: "0",
          valueRange: ["0", "10"]
        },
        "dota_health_hurt_delay": { 
          name: "HP Bar Delay", 
          desc: "General delay before HP bar updates register.", 
          default: "0",
          valueRange: ["0", "5"]
        },
        "dota_pain_decay": { 
          name: "HP Pain Decay", 
          desc: "Speed at which damage indicators fade away.", 
          default: "0",
          valueRange: ["0", "1"]
        },
        "dota_pain_factor": { 
          name: "HP Pain Factor", 
          desc: "Controls how quickly HP loss animations play.", 
          default: "0",
          valueRange: ["0", "1"]
        },
        "dota_pain_multiplier": { 
          name: "HP Pain Multiplier", 
          desc: "Strength of the red damage flash effect.", 
          default: "0",
          valueRange: ["0", "1"]
        }
      }
    };
    
    this.binds = [
      'bind "ctrl" "+dota_unit_movetodirection"',
      'bind "f7" disconnect'
    ];
  }

  validateInput(value, valueRange, category) {
    const numValue = parseFloat(value);
    const minValue = parseFloat(valueRange[0]);
    const maxValue = parseFloat(valueRange[1]);
    
    if (category !== "healthbar" && valueRange[0] === "0" && valueRange[1] === "1") {
      return value === "0" || value === "1";
    }
    if (isNaN(numValue) || numValue < minValue || numValue > maxValue) {
      return false;
    }
    
    return true;
  }

  async promptWithValidation(question, category) {
    let isValid = false;
    let answer;
    
    while (!isValid) {
      const response = await inquirer.prompt([question]);
      const value = response[question.name];
      
      if (question.valueRange[0] === "0" && question.valueRange[1] === "1" && category != "healthbar" && !this.validateInput(value, question.valueRange, category)) {
        console.log(chalk.red(`Not valid. Enter 1 for yes or 0 for no`))
      }
      else if (question.valueRange && !this.validateInput(value, question.valueRange, category)) {
        console.log(chalk.red(`Not valid. Please enter a value between ${question.valueRange[0]} and ${question.valueRange[1]}.`));
      } else {
        isValid = true;
        answer = value;
      }
    }
    
    return answer;
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

      }
    }

    return null;
  }

  async getConfigValues() {
    const answers = {};
  
    for (const [category, settings] of Object.entries(this.settings)) {
      if (category === "healthbar") {

        const instantHpQuestion = {
          type: "input",
          name: "instant_hp_update",
          message: `${chalk.green("Instantly Show HP Loss")}: If set to 1, all HP bar delays/animations will be disabled. (0-1)`,
          default: "1",
          valueRange: ["0", "1"]
        };
        
        const instantHpValue = await this.promptWithValidation(instantHpQuestion);
        answers.instant_hp_update = instantHpValue;
        
        if (instantHpValue === "1") {

          Object.assign(answers, {
            "dota_health_hurt_decay_time_max": "0",
            "dota_health_hurt_decay_time_min": "0",
            "dota_health_hurt_delay": "0",
            "dota_pain_decay": "0",
            "dota_pain_factor": "0",
            "dota_pain_multiplier": "0"
          });
        } else {
          for (const [cmd, { name, desc, default: defaultVal, valueRange }] of Object.entries(settings)) {
            const question = {
              type: 'input',
              name: cmd,
              message: `${chalk.green(name)}: ${desc} (${valueRange[0]}-${valueRange[1]})`,
              default: defaultVal,
              valueRange: valueRange
            };
            
            answers[cmd] = await this.promptWithValidation(question, category);
          }
        }
        
        continue; 
      }
  
      for (const [cmd, { name, desc, default: defaultVal, valueRange }] of Object.entries(settings)) {
        const question = {
          type: 'input',
          name: cmd,
          message: `${chalk.green(name)}: ${desc} (${valueRange[0]}-${valueRange[1]})`,
          default: defaultVal,
          valueRange: valueRange
        };
        
        answers[cmd] = await this.promptWithValidation(question);
      }
    }
  
    return answers;
  }

  generateConfig(configValues) {
    const lines = [];
    
    lines.push('// Generated by dota2-autoexec-generator');
    lines.push('// https://github.com/rossi2nico/dota2-autoexec-generator\n');
    
    lines.push('// Settings');
    for (const [cmd, value] of Object.entries(configValues)) {
      if (cmd !== 'instant_hp_update') {
        lines.push(`${cmd} "${value}"`);
      }
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
      // File doesn't exist, no backup needed
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