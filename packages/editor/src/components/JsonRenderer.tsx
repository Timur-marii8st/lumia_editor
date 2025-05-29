export class JsonRenderer {
  static async render(canvas: HTMLCanvasElement, data: any): Promise<void> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a'; // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (this.isSketchboardJson(data)) {
      await this.renderSketchboard(ctx, data);
    } else if (this.isGraphJson(data)) {
      await this.renderGraph(ctx, data);
    } else if (this.isLifeBalanceJson(data)) {
      await this.renderLifeBalance(ctx, data);
    }
  }

  private static isSketchboardJson(data: any): boolean {
    return data.hasOwnProperty('lines') || data.hasOwnProperty('texts');
  }

  private static isGraphJson(data: any): boolean {
    return data.hasOwnProperty('nodes') && data.hasOwnProperty('edges');
  }

  private static isLifeBalanceJson(data: any): boolean {
    return data.hasOwnProperty('sectors');
  }

  private static async renderSketchboard(ctx: CanvasRenderingContext2D, data: any) {
    // Render lines
    data.lines?.forEach((line: any) => {
      if (line.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.lineWidth;
      
      ctx.moveTo(line.points[0], line.points[1]);
      for (let i = 2; i < line.points.length; i += 2) {
        ctx.lineTo(line.points[i], line.points[i + 1]);
      }
      ctx.stroke();
    });

    // Render texts
    data.texts?.forEach((text: any) => {
      ctx.fillStyle = text.color;
      ctx.font = '16px Arial';
      ctx.fillText(text.text, text.x, text.y);
    });
  }

  private static async renderGraph(ctx: CanvasRenderingContext2D, data: any) {
    // Draw edges first
    data.edges.forEach((edge: any) => {
      const fromNode = data.nodes.find((n: any) => n.id === edge.from);
      const toNode = data.nodes.find((n: any) => n.id === edge.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    data.nodes.forEach((node: any) => {
      ctx.fillStyle = node.color;
      ctx.strokeStyle = node.borderColor;
      ctx.lineWidth = node.borderWidth;

      // Draw node shape
      ctx.beginPath();
      if (node.shape === 'square') {
        const size = 40;
        ctx.rect(node.x - size/2, node.y - size/2, size, size);
      }
      ctx.fill();
      ctx.stroke();

      // Draw node text
      ctx.fillStyle = '#000000';
      ctx.font = `${node.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.text, node.x, node.y + 5);
    });
  }

  private static async renderLifeBalance(ctx: CanvasRenderingContext2D, data: any) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    let startAngle = 0;
    const total = data.sectors.reduce((sum: number, sector: any) => sum + sector.weight, 0);

    data.sectors.forEach((sector: any) => {
      const angle = (sector.weight / total) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      ctx.closePath();

      ctx.fillStyle = sector.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Add sector name
      const textAngle = startAngle + angle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);

      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(sector.name, textX, textY);

      startAngle += angle;
    });
  }
}